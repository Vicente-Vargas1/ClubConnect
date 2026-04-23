import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useSocialStore } from "../store/useSocialStore";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import { Heart, MessageCircle, Trash2, Send, Calendar, Clock, MapPin, DollarSign, Music, Check, X } from "lucide-react";
import vinylImage from "../assets/vinyl.png";
import { formatMessageTime, formatTimeTo12Hr, parseMentions } from "../lib/utils";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const PostCard = ({ post }) => {
  const { authUser } = useAuthStore();
  const { toggleLike, addComment, deletePost, updatePostInterested } = useSocialStore();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [interestLoading, setInterestLoading] = useState(false);
  const [showInterestedModal, setShowInterestedModal] = useState(false);

  const interestedUsers = post.lookingForDJ?.interestedUsers || [];

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

  const handleMessageDJ = (dj) => {
    const { togglePopup, setPopupSelectedUser, isPopupOpen } = useChatStore.getState();
    if (!isPopupOpen) togglePopup();
    setPopupSelectedUser(dj);
    useChatStore.setState({
      pendingPopupMessage: `Hi ${dj.fullName}! This venue would like to book you for our event${
        djData?.date ? ` on ${new Date(djData.date).toLocaleDateString()}` : ""
      }${djData?.venueName ? ` at ${djData.venueName}` : ""}. Are you interested?`,
    });
    setShowInterestedModal(false);
  };

  const handleInterest = async () => {
    if (authUser.role !== "dj") return;
    setInterestLoading(true);
    try {
      const res = await axiosInstance.put(`/posts/${post._id}/interested`);
      updatePostInterested(post._id, res.data.interestedUsers);
      toast.success(isInterested ? "Interest removed" : "Interest expressed!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update interest");
    } finally {
      setInterestLoading(false);
    }
  };

  const renderText = (text) =>
    parseMentions(text).map((seg, i) =>
      seg.type === "mention" ? (
        <Link key={i} to={`/profile/${seg.id}`} className="text-primary hover:underline font-medium">
          @{seg.name}
        </Link>
      ) : (
        <span key={i}>{seg.value}</span>
      )
    );

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
                {formatTimeTo12Hr(djData.time)}
              </span>
            )}
            {djData?.pay && (
              <span className="flex items-center gap-1">
                <DollarSign className="size-3.5" />
                {String(djData.pay).replace(/^\$+/, "")}
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
          {post.text && <p className="text-sm mt-1">{renderText(post.text)}</p>}
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
          {isOwner && interestedUsers.length > 0 ? (
            <button
              onClick={() => setShowInterestedModal(true)}
              className="text-xs text-primary hover:underline ml-auto"
            >
              {interestedUsers.length} DJ{interestedUsers.length !== 1 ? "s" : ""} interested →
            </button>
          ) : (
            <span className="text-xs text-base-content/50 ml-auto">
              {interestedUsers.length} DJ{interestedUsers.length !== 1 ? "s" : ""} interested
            </span>
          )}
        </div>

        {showInterestedModal && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowInterestedModal(false)}
          >
            <div
              className="bg-base-100 rounded-xl p-5 w-full max-w-md max-h-[70vh] overflow-y-auto space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Interested DJs</h3>
                <button
                  onClick={() => setShowInterestedModal(false)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <X className="size-4" />
                </button>
              </div>
              {interestedUsers.map((dj) => (
                <div key={dj._id || dj} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <Link to={`/profile/${dj._id}`}>
                    <img
                      src={dj.profilePic || vinylImage}
                      className="size-10 rounded-full object-cover cursor-pointer"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${dj._id}`}>
                      <p className="font-semibold text-sm hover:underline">{dj.fullName}</p>
                    </Link>
                    {dj.profile?.dj?.genres?.length > 0 && (
                      <p className="text-xs text-base-content/60 truncate">
                        {dj.profile.dj.genres.join(", ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleMessageDJ(dj)}
                    className="btn btn-sm btn-primary gap-1"
                  >
                    <MessageCircle className="size-3.5" />
                    Message
                  </button>
                </div>
              ))}
              {interestedUsers.length === 0 && (
                <p className="text-center text-base-content/50 text-sm py-4">
                  No DJs interested yet.
                </p>
              )}
            </div>
          </div>
        )}
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
        <p className="px-4 pb-2 text-sm">{renderText(post.text)}</p>
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
