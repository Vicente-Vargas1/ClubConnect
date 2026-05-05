import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRecentContacts = async (req, res) => {
  try {
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: myId }, { receiverId: myId }],
    }).sort({ createdAt: -1 });

    const contactMap = new Map();
    for (const msg of messages) {
      const otherId = msg.senderId.equals(myId)
        ? msg.receiverId.toString()
        : msg.senderId.toString();
      if (!contactMap.has(otherId)) {
        contactMap.set(otherId, msg);
      }
    }

    const allUsers = await User.find({ _id: { $ne: myId } }).select("-password");

    const chattedIds = [...contactMap.keys()];
    const chattedUsers = [];
    const restUsers = [];

    for (const user of allUsers) {
      if (chattedIds.includes(user._id.toString())) {
        chattedUsers.push(user);
      } else {
        restUsers.push(user);
      }
    }

    chattedUsers.sort((a, b) => {
      const aTime = contactMap.get(a._id.toString())?.createdAt || 0;
      const bTime = contactMap.get(b._id.toString())?.createdAt || 0;
      return new Date(bTime) - new Date(aTime);
    });

    const result = [...chattedUsers, ...restUsers].map((user) => {
      const lastMsg = contactMap.get(user._id.toString());
      return {
        ...user.toObject(),
        lastMessage: lastMsg
          ? {
              text: lastMsg.text
                ? lastMsg.text.substring(0, 40) + (lastMsg.text.length > 40 ? "…" : "")
                : lastMsg.image
                ? "📷 Image"
                : lastMsg.audio
                ? "🎵 Audio clip"
                : "",
              createdAt: lastMsg.createdAt,
            }
          : null,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getRecentContacts:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, read: false },
      { read: true }
    );

    const senderSocketId = getReceiverSocketId(userToChatId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", { by: myId.toString() });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let audioUrl;
    if (audio) {
      const uploadResponse = await cloudinary.uploader.upload(audio, { resource_type: "auto" });
      audioUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio: audioUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};