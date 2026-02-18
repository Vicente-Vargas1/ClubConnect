import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useSocialStore } from "../store/useSocialStore";
import { Heart, MessageCircle, Trash2, Send } from "lucide-react";
import { formatMessageTime } from "../lib/utils";

const PostCard = ({ post }) => {
  const { authUser } = useAuthStore();
  const { toggleLike, addComment, deletePost } = useSocialStore();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const isLiked = post.likes?.some(
    (id) => id === authUser._id || id?._id === authUser._id,
  );
  const isOwner =
    post.userId?._id === authUser._id || post.userId === authUser._id;

  const handleLike = () => toggleLike(post._id);

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post._id, commentText.trim());
    setCommentText("");
  };

  return (
    <div className="bg-base-100 rounded-xl shadow border border-base-300 w-full max-w-xl mx-auto">
      {/* Post Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <img
            src={post.userId?.profilePic || "/avatar.png"}
            alt={post.userId?.fullName}
            className="size-10 rounded-full object-cover border border-base-300"
          />
          <div>
            <p className="font-semibold text-sm">{post.userId?.fullName}</p>
            <p className="text-xs text-base-content/50">
              {formatMessageTime(post.createdAt)}
            </p>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => deletePost(post._id)}
            className="btn btn-ghost btn-xs text-error"
            title="Delete post"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      {/* Caption */}
      {post.text && (
        <p className="px-4 pb-2 text-sm text-base-content">{post.text}</p>
      )}

      {/* Image */}
      {post.image && (
        <img
          src={post.image}
          alt="post"
          className="w-full max-h-[480px] object-cover"
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-base-200">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            isLiked ? "text-red-500" : "text-base-content/60 hover:text-red-400"
          }`}
        >
          <Heart className={`size-5 ${isLiked ? "fill-red-500" : ""}`} />
          <span>{post.likes?.length ?? 0}</span>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary transition-colors"
        >
          <MessageCircle className="size-5" />
          <span>{post.comments?.length ?? 0}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-base-200 space-y-3 pt-3">
          {post.comments?.length > 0 ? (
            post.comments.map((c, i) => (
              <div key={i} className="flex gap-2 items-start">
                <img
                  src={c.userId?.profilePic || "/avatar.png"}
                  className="size-7 rounded-full object-cover border border-base-300 flex-shrink-0"
                  alt={c.userId?.fullName}
                />
                <div className="bg-base-200 rounded-lg px-3 py-1.5 text-sm flex-1">
                  <span className="font-semibold mr-1">
                    {c.userId?.fullName}
                  </span>
                  {c.text}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-base-content/40">No comments yet.</p>
          )}

          {/* Comment input */}
          <form onSubmit={handleComment} className="flex gap-2 mt-2">
            <img
              src={authUser.profilePic || "/avatar.png"}
              className="size-7 rounded-full object-cover border border-base-300 flex-shrink-0"
              alt="you"
            />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment…"
              className="input input-bordered input-sm flex-1"
            />
            <button type="submit" className="btn btn-sm btn-primary px-2">
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
