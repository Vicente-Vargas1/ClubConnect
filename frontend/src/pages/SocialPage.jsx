import { useEffect } from "react";
import { useSocialStore } from "../store/useSocialStore";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import { Loader } from "lucide-react";

const SocialPage = () => {
  const { posts, fetchPosts, isLoadingPosts } = useSocialStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-base-200 pt-20 pb-10">
      <div className="max-w-xl mx-auto px-4 space-y-6">
        <h2 className="text-2xl font-bold text-center">Social Feed</h2>

        {/* Create post */}
        <CreatePost />

        {/* Feed */}
        {isLoadingPosts ? (
          <div className="flex justify-center py-12">
            <Loader className="size-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-base-content/50 py-12">
            <p className="text-lg">No posts yet.</p>
            <p className="text-sm">Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialPage;
