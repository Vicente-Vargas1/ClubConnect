import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

// Get posts from followed users only
export const getFollowingPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const following = currentUser.following;

    const posts = await Post.find({ userId: { $in: following } })
      .sort({ createdAt: -1 })
      .populate("userId", "fullName profilePic")
      .populate("comments.userId", "fullName profilePic")
      .populate("lookingForDJ.interestedUsers", "fullName profilePic role profile.dj.genres");

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getFollowingPosts:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get liked posts for authenticated user
export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await Post.find({ likes: userId })
      .sort({ createdAt: -1 })
      .populate("userId", "fullName profilePic")
      .populate("comments.userId", "fullName profilePic")
      .populate("lookingForDJ.interestedUsers", "fullName profilePic role profile.dj.genres");

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getLikedPosts:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all posts (feed), newest first
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("userId", "fullName profilePic")
      .populate("comments.userId", "fullName profilePic")
      .populate("lookingForDJ.interestedUsers", "fullName profilePic role profile.dj.genres");

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getPosts:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { text, image, location, postType, lookingForDJ } = req.body;
    const userId = req.user._id;

    if (postType === "lookingForDJ") {
      if (req.user.role !== "venue") {
        return res.status(403).json({ message: "Only venue accounts can post Looking for DJ listings" });
      }
      if (!lookingForDJ?.date || !lookingForDJ?.venueName) {
        return res.status(400).json({ message: "Date and venue name are required for Looking for DJ posts" });
      }
    } else if (!text && !image) {
      return res.status(400).json({ message: "Post must have text or an image" });
    }

    let imageUrl = "";
    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image);
      imageUrl = uploadRes.secure_url;
    }

    const post = new Post({
      userId,
      text,
      image: imageUrl,
      location: location || {},
      postType: postType || "regular",
      lookingForDJ: postType === "lookingForDJ" ? { ...lookingForDJ, interestedUsers: [] } : undefined,
    });
    await post.save();

    await post.populate("userId", "fullName profilePic");

    res.status(201).json(post);
  } catch (error) {
    console.log("Error in createPost:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Toggle like on a post
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;
    const alreadyLiked = post.likes.some((id) => id.equals(userId));

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => !id.equals(userId));
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({ likes: post.likes });
  } catch (error) {
    console.log("Error in toggleLike:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Add a comment to a post
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text)
      return res.status(400).json({ message: "Comment text is required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ userId: req.user._id, text });
    await post.save();

    await post.populate("comments.userId", "fullName profilePic");

    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json(newComment);
  } catch (error) {
    console.log("Error in addComment:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Toggle DJ interest in a "Looking for DJ" post
export const toggleInterested = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.postType !== "lookingForDJ") {
      return res.status(400).json({ message: "This post is not a Looking for DJ post" });
    }
    if (req.user.role !== "dj") {
      return res.status(403).json({ message: "Only DJs can express interest" });
    }

    const userId = req.user._id;
    const alreadyInterested = post.lookingForDJ.interestedUsers.some((id) => id.equals(userId));

    if (alreadyInterested) {
      post.lookingForDJ.interestedUsers = post.lookingForDJ.interestedUsers.filter(
        (id) => !id.equals(userId)
      );
    } else {
      post.lookingForDJ.interestedUsers.push(userId);
    }

    await post.save();

    // Emit socket event to venue owner
    if (!alreadyInterested) {
      const { getReceiverSocketId, io } = await import("../lib/socket.js");
      const venueSocketId = getReceiverSocketId(post.userId.toString());
      if (venueSocketId) {
        io.to(venueSocketId).emit("djInterested", {
          djId: req.user._id,
          djName: req.user.fullName,
          djProfilePic: req.user.profilePic,
          postId: post._id,
          postDate: post.lookingForDJ.date,
        });
      }
    }

    res.status(200).json({ interestedUsers: post.lookingForDJ.interestedUsers });
  } catch (error) {
    console.log("Error in toggleInterested:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get open "Looking for DJ" posts (future, unfilled), sorted by soonest date
export const getOpenDJPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      postType: "lookingForDJ",
      "lookingForDJ.date": { $gte: new Date() },
      "lookingForDJ.bookingId": null,
    })
      .sort({ "lookingForDJ.date": 1 })
      .populate("userId", "fullName profilePic")
      .populate("lookingForDJ.interestedUsers", "fullName profilePic");

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getOpenDJPosts:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a post (only by owner)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.userId.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.log("Error in deletePost:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
