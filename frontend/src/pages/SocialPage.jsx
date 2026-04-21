import { useEffect } from "react";
import { Clock, Loader, TrendingUp } from "lucide-react";
import { useSocialStore } from "../store/useSocialStore";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";

const SocialPage = () => {
  const { fetchPosts, isLoadingPosts, sortBy, setSortBy, getSortedPosts } =
    useSocialStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const sortedPosts = getSortedPosts();

  return (
    <div className="min-h-screen bg-base-200 pt-20 pb-10">
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <h2 className="text-2xl font-bold text-center">Social Feed</h2>

        {/* Create post */}
        <CreatePost />

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy("newest")}
            className={`btn btn-sm gap-2 ${
              sortBy === "newest" ? "btn-primary" : "btn-ghost"
            }`}
          >
            <Clock className="size-4" />
            Newest
          </button>
          <button
            onClick={() => setSortBy("popular")}
            className={`btn btn-sm gap-2 ${
              sortBy === "popular" ? "btn-primary" : "btn-ghost"
            }`}
          >
            <TrendingUp className="size-4" />
            Most Popular
          </button>
        </div>

        {/* Feed */}
        {isLoadingPosts ? (
          <div className="flex justify-center py-12">
            <Loader className="size-8 animate-spin text-primary" />
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="text-center text-base-content/50 py-12">
            <p className="text-lg">No posts yet.</p>
            <p className="text-sm">Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {sortedPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialPage;
