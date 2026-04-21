import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
  getUserById
} from "../controllers/auth.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

// 🔥 NEW
router.get("/user/:id", protectRoute, getUserById);

export default router;