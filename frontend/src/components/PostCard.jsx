import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useSocialStore } from "../store/useSocialStore";
import { Heart, MessageCircle, Trash2, Send } from "lucide-react";
import vinylImage from "../assets/vinyl.png";
import { formatMessageTime } from "../lib/utils";
import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
  const { authUser } = useAuthStore();
  const { toggleLike, addComment, deletePost } = useSocialStore();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const fallbackAvatar = vinylImage;

  const isLiked = post.likes?.some(
    (id) => id === authUser._id || id?._id === authUser._id
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