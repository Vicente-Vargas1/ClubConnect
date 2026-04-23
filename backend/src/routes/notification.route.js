import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.get("/unread-count", protectRoute, getUnreadCount);
router.put("/mark-all-read", protectRoute, markAllRead);

export default router;
