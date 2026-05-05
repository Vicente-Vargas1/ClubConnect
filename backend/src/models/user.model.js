import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    profilePic: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["dj", "venue"],
      required: true,
    },

    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],

    profile: {
      dj: {
        location: String,
        genres: [String],
        bio: String,
        instagram: String,
        youtube: String,
        soundcloud: String,
        availableForBookings: { type: Boolean, default: false },
        audioPreview: { type: String, default: "" },
      },

      venue: {
        location: String,
        capacity: Number,
        venueType: String,
        contactEmail: String,
        description: String,
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;