import User from "../models/user.model.js";

export const toggleFollow = async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.user._id;

    if (targetId === userId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetId),
    ]);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const isFollowing = currentUser.following.some((id) => id.equals(targetId));

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter((id) => !id.equals(targetId));
      targetUser.followers = targetUser.followers.filter((id) => !id.equals(userId));
    } else {
      // Follow
      currentUser.following.push(targetId);
      targetUser.followers.push(userId);
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.status(200).json({
      following: currentUser.following,
      followers: currentUser.followers,
      targetFollowers: targetUser.followers,
      targetFollowing: targetUser.following,
    });
  } catch (error) {
    console.log("Error in toggleFollow:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "fullName profilePic role"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.followers);
  } catch (error) {
    console.log("Error in getFollowers:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "fullName profilePic role"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.following);
  } catch (error) {
    console.log("Error in getFollowing:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
