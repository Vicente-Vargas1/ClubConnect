import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getPosts,
  createPost,
  toggleLike,
  addComment,
  deletePost,
  getFollowingPosts,
  getLikedPosts,
  toggleInterested,
  getOpenDJPosts,
  getPostsByUser,
} from "../controllers/post.controller.js";

const router = express.Router();

// Named routes must come before /:id wildcard routes
router.get("/following", protectRoute, getFollowingPosts);
router.get("/liked", protectRoute, getLikedPosts);
router.get("/open-dj", protectRoute, getOpenDJPosts);
router.get("/user/:userId", protectRoute, getPostsByUser);
router.get("/", protectRoute, getPosts);
router.post("/", protectRoute, createPost);
router.put("/:id/like", protectRoute, toggleLike);
router.put("/:id/interested", protectRoute, toggleInterested);
router.post("/:id/comment", protectRoute, addComment);
router.delete("/:id", protectRoute, deletePost);

export default router;
