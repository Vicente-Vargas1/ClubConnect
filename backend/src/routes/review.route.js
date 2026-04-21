import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getReviews, submitReview, deleteReview } from "../controllers/review.controller.js";

const router = express.Router();

router.get("/:userId", protectRoute, getReviews);
router.post("/:userId", protectRoute, submitReview);
router.delete("/:userId", protectRoute, deleteReview);

export default router;
