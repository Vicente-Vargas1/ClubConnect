import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useSocialStore } from "../store/useSocialStore";
import { axiosInstance } from "../lib/axios";
import { Heart, MessageCircle, Trash2, Send, Calendar, Clock, MapPin, DollarSign, Music, Check } from "lucide-react";
import vinylImage from "../assets/vinyl.png";
import { formatMessageTime } from "../lib/utils";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const PostCard = ({ post }) => {
  const { authUser } = useAuthStore();
  const { toggleLike, addComment, deletePost } = useSocialStore();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [interestedUsers, setInterestedUsers] = useState(post.lookingForDJ?.interestedUsers || []);
  const [interestLoading, setInterestLoading] = useState(false);

  const fallbackAvatar = vinylImage;

  const isLiked = post.likes?.some(
    (id) => id === authUser._id || id?._id === authUser._id
  );

  const isOwner =
    post.userId?._id === authUser._id || post.userId === authUser._id;

  const isInterested = interestedUsers.some(
    (id) => id === authUser._id || id?._id === authUser._id || id?.toString() === authUser._id
  );

  const handleLike = () => toggleLike(post._id);

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post._id, commentText.trim());
    setCommentText("");
  };

  const handleInterest = async () => {
    if (authUser.role !== "dj") return;
    setInterestLoading(true);
    try {
      const res = await axiosInstance.put(`/posts/${post._id}/interested`);
      setInterestedUsers(res.data.interestedUsers);
      toast.success(isInterested ? "Interest removed" : "Interest expressed!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update interest");
    } finally {
      setInterestLoading(false);
    }
  };

  const isLookingForDJ = post.postType === "lookingForDJ";
  const djData = post.lookingForDJ;
  const isExpired = djData?.date && new Date(djData.date) < new Date();
  const isFilled = Boolean(djData?.bookingId);

  if (isLookingForDJ) {
    return (
      <div className="bg-base-100 rounded-xl shadow border-2 border-secondary w-full max-w-xl mx-auto">

        {/* Banner */}
        <div className="bg-secondary/20 px-4 pt-3 pb-2 flex items-center gap-2">
          <Music className="size-4 text-secondary" />
          <span className="text-secondary font-semibold text-sm uppercase tracking-wide">
            Looking for a DJ
          </span>
          {(isExpired || isFilled) && (
            <span className="ml-auto badge badge-sm badge-ghost">
              {isFilled ? "Filled" : "Expired"}
            </span>
          )}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.userId?._id}`}>
              <img
                src={post.userId?.profilePic || fallbackAvatar}
                alt="user"
                className="size-9 rounded-full object-cover border border-base-300 cursor-pointer"
              />
            </Link>
            <div>
              <Link to={`/profile/${post.userId?._id}`}>
                <p className="font-semibold text-sm hover:underline">{post.userId?.fullName}</p>
              </Link>
              <p className="text-xs text-base-content/50">{formatMessageTime(post.createdAt)}</p>
            </div>
          </div>
          {isOwner && (
            <button onClick={() => deletePost(post._id)} className="btn btn-ghost btn-xs text-error">
              <Trash2 className="size-4" />
            </button>
          )}
        </div>

        {/* DJ details */}
        <div className="px-4 py-3 space-y-1.5">
          {djData?.venueName && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="size-4 text-base-content/50 flex-shrink-0" />
              <span className="font-medium">{djData.venueName}</span>
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-base-content/70">
            {djData?.date && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {new Date(djData.date).toLocaleDateString()}
              </span>
            )}
            {djData?.time && (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {djData.time}
              </span>
            )}
            {djData?.pay && (
              <span className="flex items-center gap-1">
                <DollarSign className="size-3.5" />
                {djData.pay}
              </span>
            )}
          </div>
          {djData?.genre && (
            <p className="text-sm text-base-content/70">
              <span className="font-medium">Genre:</span> {djData.genre}
            </p>
          )}
          {djData?.eventDescription && (
            <p className="text-sm text-base-content/80">{djData.eventDescription}</p>
          )}
          {post.text && <p className="text-sm mt-1">{post.text}</p>}
        </div>

        {post.image && (
          <img src={post.image} className="w-full max-h-[480px] object-cover" />
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 px-4 py-3 border-t border-base-200">
          {authUser.role === "dj" && !isExpired && !isFilled && (
            <button
              onClick={handleInterest}
              disabled={interestLoading}
              className={`flex items-center gap-1.5 text-sm btn btn-xs ${
                isInterested ? "btn-secondary" : "btn-ghost border"
              }`}
            >
              {isInterested ? <Check className="size-3.5" /> : <Music className="size-3.5" />}
              {isInterested ? "Interested ✓" : "I'm Interested"}
            </button>
          )}
          <span className="text-xs text-base-content/50 ml-auto">
            {interestedUsers.length} DJ{interestedUsers.length !== 1 ? "s" : ""} interested
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-xl shadow border border-base-300 w-full max-w-xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">

          {/* CLICKABLE PROFILE PIC */}
          <Link to={`/profile/${post.userId?._id}`}>
            <img
              src={post.userId?.profilePic || fallbackAvatar}
              alt="user"
              className="size-10 rounded-full object-cover border border-base-300 cursor-pointer"
            />
          </Link>

          <div>
            {/* CLICKABLE NAME */}
            <Link to={`/profile/${post.userId?._id}`}>
              <p className="font-semibold text-sm hover:underline">
                {post.userId?.fullName}
              </p>
            </Link>

            <p className="text-xs text-base-content/50">
              {formatMessageTime(post.createdAt)}
            </p>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => deletePost(post._id)}
            className="btn btn-ghost btn-xs text-error"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      {/* TEXT */}
      {post.text && (
        <p className="px-4 pb-2 text-sm">{post.text}</p>
      )}

      {/* IMAGE */}
      {post.image && (
        <img
          src={post.image}
          className="w-full max-h-[480px] object-cover"
        />
      )}

      {/* ACTIONS */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-base-200">

        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm ${
            isLiked ? "text-red-500" : "text-base-content/60"
          }`}
        >
          <Heart className={`size-5 ${isLiked ? "fill-red-500" : ""}`} />
          <span>{post.likes?.length ?? 0}</span>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-base-content/60"
        >
          <MessageCircle className="size-5" />
          <span>{post.comments?.length ?? 0}</span>
        </button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="px-4 pb-4 space-y-3 pt-3 border-t">

          {post.comments?.map((c, i) => (
            <div key={i} className="flex gap-2">
              <img
                src={c.userId?.profilePic || fallbackAvatar}
                className="size-7 rounded-full object-cover"
              />
              <div className="bg-base-200 px-3 py-1.5 rounded-lg text-sm flex-1">
                <span className="font-semibold mr-1">
                  {c.userId?.fullName}
                </span>
                {c.text}
              </div>
            </div>
          ))}

          <form onSubmit={handleComment} className="flex gap-2">
            <img
              src={authUser.profilePic || fallbackAvatar}
              className="size-7 rounded-full"
            />

            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="input input-bordered input-sm flex-1"
              placeholder="Add comment..."
            />

            <button className="btn btn-sm btn-primary">
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
