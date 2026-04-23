import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error in getNotifications:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user._id,
      read: false,
    });
    res.status(200).json({ count });
  } catch (error) {
    console.log("Error in getUnreadCount:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, read: false },
      { read: true }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.log("Error in markAllRead:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
