import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    audio: {
      type: String,
      default: "",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [commentSchema],
    location: {
      name: { type: String, default: "" },
      lat: { type: Number },
      lng: { type: Number },
    },
    postType: {
      type: String,
      enum: ["regular", "lookingForDJ"],
      default: "regular",
    },
    lookingForDJ: {
      date: Date,
      time: String,
      venueName: String,
      pay: String,
      genre: String,
      eventDescription: String,
      interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        default: null,
      },
    },
  },
  { timestamps: true },
);

const Post = mongoose.model("Post", postSchema);

export default Post;
