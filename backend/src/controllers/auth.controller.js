import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

/* =========================
   SIGNUP
========================= */
export const signup = async (req, res) => {
  const { fullName, email, password, role, profile } = req.body;

  try {
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["dj", "venue"].includes(role)) {
      return res.status(400).json({ message: "Invalid role type" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,

      // ✅ SAFE PROFILE STRUCTURE
      profile:
        role === "dj"
          ? { dj: profile || {} }
          : role === "venue"
          ? { venue: profile || {} }
          : {},
    });

    await newUser.save();
    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      role: newUser.role,
      profile: newUser.profile,
      following: newUser.following,
      followers: newUser.followers,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* =========================
   LOGIN
========================= */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
      profile: user.profile,
      following: user.following,
      followers: user.followers,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* =========================
   LOGOUT
========================= */
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* =========================
   UPDATE PROFILE PIC
========================= */
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    // ✅ CLEAN RESPONSE (IMPORTANT)
    res.status(200).json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      role: updatedUser.role,
      profile: updatedUser.profile,
      following: updatedUser.following,
      followers: updatedUser.followers,
    });
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================
   AUTH CHECK
========================= */
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* =========================
   UPDATE PROFILE FIELDS (bio, location, genres, social links, etc.)
========================= */
export const updateProfileData = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "dj") {
      const { bio, location, genres, instagram, soundcloud, availableForBookings, audioPreview } = req.body;

      let audioPreviewUrl = user.profile?.dj?.audioPreview || "";
      if (audioPreview === "") {
        audioPreviewUrl = "";
      } else if (audioPreview && audioPreview.startsWith("data:")) {
        const uploadRes = await cloudinary.uploader.upload(audioPreview, { resource_type: "auto" });
        audioPreviewUrl = uploadRes.secure_url;
      }

      user.profile = {
        ...user.profile?.toObject?.() || user.profile,
        dj: {
          ...(user.profile?.dj?.toObject?.() || user.profile?.dj || {}),
          ...(bio !== undefined && { bio }),
          ...(location !== undefined && { location }),
          ...(genres !== undefined && { genres }),
          ...(instagram !== undefined && { instagram }),
          ...(soundcloud !== undefined && { soundcloud }),
          ...(availableForBookings !== undefined && { availableForBookings }),
          audioPreview: audioPreviewUrl,
        },
      };
    } else if (user.role === "venue") {
      const { description, location, capacity, venueType, contactEmail } = req.body;
      user.profile = {
        ...user.profile?.toObject?.() || user.profile,
        venue: {
          ...(user.profile?.venue?.toObject?.() || user.profile?.venue || {}),
          ...(description !== undefined && { description }),
          ...(location !== undefined && { location }),
          ...(capacity !== undefined && { capacity }),
          ...(venueType !== undefined && { venueType }),
          ...(contactEmail !== undefined && { contactEmail }),
        },
      };
    }

    user.markModified("profile");
    await user.save();

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
      profile: user.profile,
      following: user.following,
      followers: user.followers,
    });
  } catch (error) {
    console.log("Error in updateProfileData:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* =========================
   SEARCH USERS (for @ mentions)
========================= */
export const searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(200).json([]);
    const users = await User.find({
      fullName: { $regex: q, $options: "i" },
      _id: { $ne: req.user._id },
    })
      .select("fullName profilePic role _id profile")
      .limit(8);
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in searchUsers:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET USER BY ID
========================= */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserById:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};