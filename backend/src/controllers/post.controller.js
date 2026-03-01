import Post from "../models/post.model.js";
import cloudinary from "../lib/cloudinary.js";

// Get all posts (feed), newest first
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("userId", "fullName profilePic")
      .populate("comments.userId", "fullName profilePic");

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getPosts:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { text, image } = req.body;
    const userId = req.user._id;

    if (!text && !image) {
      return res
        .status(400)
        .json({ message: "Post must have text or an image" });
    }

    let imageUrl = "";
    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image);
      imageUrl = uploadRes.secure_url;
    }

    const post = new Post({ userId, text, image: imageUrl });
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
