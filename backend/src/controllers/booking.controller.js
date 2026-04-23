import Booking from "../models/booking.model.js";
import Post from "../models/post.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const createBooking = async (req, res) => {
  try {
    const { receiverId, date, time, venueName, pay } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !date || !time || !venueName || !pay) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const booking = new Booking({ senderId, receiverId, date, time, venueName, pay });
    await booking.save();

    await booking.populate([
      { path: "senderId", select: "fullName profilePic role" },
      { path: "receiverId", select: "fullName profilePic role" },
    ]);

    // Notify the receiver in real-time
    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newBookingRequest", booking);
    }

    res.status(201).json(booking);
  } catch (error) {
    console.log("Error in createBooking:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate("senderId", "fullName profilePic role")
      .populate("receiverId", "fullName profilePic role")
      .sort({ date: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.log("Error in getMyBookings:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUpcomingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: "accepted",
      date: { $gte: new Date() },
    })
      .populate("senderId", "fullName profilePic role")
      .populate("receiverId", "fullName profilePic role")
      .sort({ date: 1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.log("Error in getUpcomingBookings:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (!booking.receiverId.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the receiver can accept a booking" });
    }

    booking.status = "accepted";
    await booking.save();

    await booking.populate([
      { path: "senderId", select: "fullName profilePic role" },
      { path: "receiverId", select: "fullName profilePic role" },
    ]);

    // Notify sender that booking was accepted
    const senderSocketId = getReceiverSocketId(booking.senderId._id.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("bookingAccepted", booking);
    }

    res.status(200).json(booking);
  } catch (error) {
    console.log("Error in acceptBooking:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const declineBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (!booking.receiverId.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the receiver can decline a booking" });
    }

    booking.status = "declined";
    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    console.log("Error in declineBooking:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const userId = req.user._id;
    if (!booking.senderId.equals(userId) && !booking.receiverId.equals(userId)) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    booking.status = "cancelled";

    // Delete the linked auto-post if it exists
    if (booking.autoPostId) {
      await Post.findByIdAndDelete(booking.autoPostId);
      booking.autoPostId = null;
    }

    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    console.log("Error in cancelBooking:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPendingCount = async (req, res) => {
  try {
    const count = await Booking.countDocuments({
      receiverId: req.user._id,
      status: "pending",
    });
    res.status(200).json({ count });
  } catch (error) {
    console.log("Error in getPendingCount:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const linkPost = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const { postId } = req.body;
    booking.autoPostId = postId;
    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    console.log("Error in linkPost:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
