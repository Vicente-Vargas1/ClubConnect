import Review from "../models/review.model.js";
import Notification from "../models/notification.model.js";

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedUserId: req.params.userId })
      .populate("reviewerId", "fullName profilePic")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    res.status(200).json({ reviews, averageRating, totalReviews });
  } catch (error) {
    console.log("Error in getReviews:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const submitReview = async (req, res) => {
  try {
    const { rating, text } = req.body;
    const reviewerId = req.user._id;
    const reviewedUserId = req.params.userId;

    if (reviewerId.toString() === reviewedUserId) {
      return res.status(400).json({ message: "You cannot review yourself" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const review = await Review.findOneAndUpdate(
      { reviewerId, reviewedUserId },
      { rating, text: text || "" },
      { upsert: true, new: true }
    );

    await review.populate("reviewerId", "fullName profilePic");

    await Notification.create({
      recipientId: reviewedUserId,
      senderId: reviewerId,
      type: "new_review",
      message: `${req.user.fullName} left you a ${rating}-star review`,
    });

    res.status(200).json(review);
  } catch (error) {
    console.log("Error in submitReview:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const reviewerId = req.user._id;
    const reviewedUserId = req.params.userId;

    const review = await Review.findOneAndDelete({ reviewerId, reviewedUserId });
    if (!review) return res.status(404).json({ message: "Review not found" });

    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.log("Error in deleteReview:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
