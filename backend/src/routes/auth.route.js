import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
  updateProfileData,
  getUserById,
  searchUsers,
} from "../controllers/auth.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.put("/update-profile-data", protectRoute, updateProfileData);

router.get("/check", protectRoute, checkAuth);

router.get("/search-users", protectRoute, searchUsers);
router.get("/user/:id", protectRoute, getUserById);

export default router;