import { useEffect, useState } from "react";
import { Calendar, Clock, DollarSign, Music } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { useSocialStore } from "../store/useSocialStore";
import { formatTimeTo12Hr } from "../lib/utils";
import vinylImage from "../assets/vinyl.png";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const LookingForDJSidebar = () => {
  const { authUser } = useAuthStore();
  const { updatePostInterested } = useSocialStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get("/posts/open-dj");
        setPosts(res.data);
      } catch {
        console.error("Failed to load open DJ posts");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleInterest = async (post) => {
    try {
      const res = await axiosInstance.put(`/posts/${post._id}/interested`);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === post._id
            ? { ...p, lookingForDJ: { ...p.lookingForDJ, interestedUsers: res.data.interestedUsers } }
            : p
        )
      );
      updatePostInterested(post._id, res.data.interestedUsers);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update interest");
    }
  };

  const isInterested = (post) =>
    post.lookingForDJ?.interestedUsers?.some(
      (id) => id === authUser._id || id?._id === authUser._id || id?.toString() === authUser._id
    );

  return (
    <div className="bg-base-100 rounded-xl border border-base-300 shadow overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-base-300 flex-shrink-0">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Music className="size-4 text-secondary" />
          Looking for a DJ
        </h3>
      </div>

      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-spinner loading-sm text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-base-content/50 text-xs py-8 px-4">
            No open listings right now.
          </p>
        ) : (
          <ul className="divide-y divide-base-200">
            {posts.map((post) => {
              const dj = post.lookingForDJ;
              const interested = isInterested(post);
              const interestCount = dj?.interestedUsers?.length ?? 0;

              return (
                <li key={post._id} className="px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Link to={`/profile/${post.userId?._id}`}>
                      <img
                        src={post.userId?.profilePic || vinylImage}
                        className="size-7 rounded-full object-cover flex-shrink-0 cursor-pointer"
                      />
                    </Link>
                    <Link to={`/profile/${post.userId?._id}`}>
                      <span className="text-sm font-medium hover:underline truncate">
                        {post.userId?.fullName}
                      </span>
                    </Link>
                  </div>

                  <div className="space-y-0.5 pl-1 text-xs text-base-content/60">
                    {(dj?.date || dj?.time) && (
                      <div className="flex items-center gap-3">
                        {dj?.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(dj.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                        {dj?.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatTimeTo12Hr(dj.time)}
                          </span>
                        )}
                      </div>
                    )}
                    {dj?.pay && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="size-3" />
                        {dj.pay}
                      </span>
                    )}
                    {dj?.genre && (
                      <p className="truncate text-base-content/50">{dj.genre}</p>
                    )}
                  </div>

                  {authUser.role === "dj" && (
                    <button
                      onClick={() => handleInterest(post)}
                      className={`btn btn-xs w-full ${interested ? "btn-secondary" : "btn-ghost border"}`}
                    >
                      {interested ? "Interested ✓" : "I'm Interested"}
                    </button>
                  )}

                  <p className="text-xs text-base-content/40">
                    {interestCount} DJ{interestCount !== 1 ? "s" : ""} interested
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LookingForDJSidebar;
