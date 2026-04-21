import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { toggleFollow, getFollowers, getFollowing } from "../controllers/follow.controller.js";

const router = express.Router();

router.put("/:id", protectRoute, toggleFollow);
router.get("/:id/followers", protectRoute, getFollowers);
router.get("/:id/following", protectRoute, getFollowing);

export default router;
