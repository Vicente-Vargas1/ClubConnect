import { useState } from "react";
import { Heart, MessageCircle, MapPin } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useFeedStore } from "../store/useFeedStore";
import vinylImage from "../assets/vinyl.png";

const PostCard = ({ post }) => {
  const { authUser } = useAuthStore();
  const { likePost, addComment } = useFeedStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const isLiked = post.likes.some(
    (id) => id === authUser._id || id?._id === authUser._id
  );

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment(post._id, commentText.trim());
    setCommentText("");
  };

  return (
    <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4 space-y-3">
      {/* Author */}
      <div className="flex items-center gap-3">
        <img
          src={post.authorId?.profilePic || vinylImage}
          alt={post.authorId?.fullName}
          className="size-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-sm">{post.authorId?.fullName}</p>
          <p className="text-xs text-zinc-400">
            {new Date(post.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Content */}
      {post.text && <p className="text-sm leading-relaxed">{post.text}</p>}
      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="w-full rounded-lg object-cover max-h-80"
        />
      )}

      {/* Location tag */}
      {post.location?.name && (
        <div className="flex items-center gap-1 text-xs text-zinc-400">
          <MapPin className="size-3" />
          {post.location.name}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-4 pt-1 border-t border-base-300">
        <button
          onClick={() => likePost(post._id)}
          className={`flex items-center gap-1.5 text-sm transition-colors hover:text-primary ${
            isLiked ? "text-red-500" : "text-zinc-400"
          }`}
        >
          <Heart className={`size-4 ${isLiked ? "fill-red-500" : ""}`} />
          {post.likes.length}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-primary transition-colors"
        >
          <MessageCircle className="size-4" />
          {post.comments.length}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="space-y-2 pt-1">
          {post.comments.map((comment, i) => (
            <div key={comment._id || i} className="flex items-start gap-2">
              <img
                src={comment.authorId?.profilePic || vinylImage}
                alt=""
                className="size-6 rounded-full object-cover mt-0.5 flex-shrink-0"
              />
              <div className="bg-base-200 rounded-lg px-3 py-1.5 text-sm min-w-0">
                <span className="font-medium text-xs block">
                  {comment.authorId?.fullName}
                </span>
                <p className="break-words">{comment.text}</p>
              </div>
            </div>
          ))}
          <form onSubmit={handleComment} className="flex gap-2 pt-1">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="input input-sm input-bordered flex-1"
            />
            <button type="submit" className="btn btn-sm btn-primary">
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
