import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getPosts, createPost, likePost, addComment } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", protectRoute, getPosts);
router.post("/", protectRoute, createPost);
router.put("/:id/like", protectRoute, likePost);
router.post("/:id/comment", protectRoute, addComment);

export default router;
