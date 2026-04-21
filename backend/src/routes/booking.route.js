import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createBooking,
  getMyBookings,
  getUpcomingBookings,
  acceptBooking,
  declineBooking,
  cancelBooking,
  linkPost,
} from "../controllers/booking.controller.js";

const router = express.Router();

router.get("/upcoming", protectRoute, getUpcomingBookings);
router.get("/mine", protectRoute, getMyBookings);
router.post("/", protectRoute, createBooking);
router.put("/:id/accept", protectRoute, acceptBooking);
router.put("/:id/decline", protectRoute, declineBooking);
router.put("/:id/cancel", protectRoute, cancelBooking);
router.put("/:id/link-post", protectRoute, linkPost);

export default router;
