import Post from "../models/post.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("authorId", "fullName profilePic")
      .populate("comments.authorId", "fullName profilePic")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getPosts:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { text, image, location } = req.body;
    const authorId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ error: "Post must have text or image" });
    }

    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const post = new Post({
      authorId,
      text: text || "",
      image: imageUrl,
      location: location || {},
    });

    await post.save();
    await post.populate("authorId", "fullName profilePic");

    res.status(201).json(post);
  } catch (error) {
    console.error("Error in createPost:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.status(200).json({ likes: post.likes });
  } catch (error) {
    console.error("Error in likePost:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const authorId = req.user._id;

    if (!text) return res.status(400).json({ error: "Comment text is required" });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.comments.push({ authorId, text });
    await post.save();
    await post.populate("comments.authorId", "fullName profilePic");

    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error in addComment:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
