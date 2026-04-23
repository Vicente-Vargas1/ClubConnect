import { useEffect } from "react";
import { Clock, Loader, TrendingUp, Users } from "lucide-react";
import { useSocialStore } from "../store/useSocialStore";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import UpcomingEvents from "../components/UpcomingEvents";
import LookingForDJSidebar from "../components/LookingForDJSidebar";
import ChatSidebar from "../components/ChatSidebar";
import UserSearchBar from "../components/UserSearchBar";
import vinylImage from "../assets/vinyl.png";

const SocialPage = () => {
  const { fetchPosts, fetchFollowingPosts, isLoadingPosts, sortBy, setSortBy, getSortedPosts, feedMode } =
    useSocialStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const sortedPosts = getSortedPosts();

  const handleFeedMode = (mode) => {
    if (mode === "following") {
      fetchFollowingPosts();
    } else {
      fetchPosts();
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pt-20 pb-24 lg:pb-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-6">

          {/* LEFT COLUMN — Upcoming Events + DJ listings (lg+ only) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 flex flex-col gap-4 max-h-[calc(100vh-7rem)]">
              <div className="flex-1 min-h-0 overflow-hidden">
                <UpcomingEvents />
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <LookingForDJSidebar />
              </div>
            </div>
          </aside>

          {/* CENTER COLUMN — Feed */}
          <main className="flex-1 min-w-0 max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-center">Social Feed</h2>

            <UserSearchBar />

            <CreatePost />

            {/* Sort / Filter controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => { setSortBy("newest"); if (feedMode === "following") fetchPosts(); }}
                className={`btn btn-sm gap-2 ${
                  sortBy === "newest" && feedMode !== "following" ? "btn-primary" : "btn-ghost"
                }`}
              >
                <Clock className="size-4" />
                Newest
              </button>
              <button
                onClick={() => { setSortBy("popular"); if (feedMode === "following") fetchPosts(); }}
                className={`btn btn-sm gap-2 ${
                  sortBy === "popular" && feedMode !== "following" ? "btn-primary" : "btn-ghost"
                }`}
              >
                <TrendingUp className="size-4" />
                Most Popular
              </button>
              <button
                onClick={() => handleFeedMode("following")}
                className={`btn btn-sm gap-2 ${feedMode === "following" ? "btn-primary" : "btn-ghost"}`}
              >
                <Users className="size-4" />
                Following
              </button>
            </div>

            {/* Feed */}
            {isLoadingPosts ? (
              <div className="flex justify-center py-12">
                <Loader className="size-8 animate-spin text-primary" />
              </div>
            ) : sortedPosts.length === 0 ? (
              <div className="text-center text-base-content/50 py-12">
                <p className="text-lg">
                  {feedMode === "following" ? "No posts from people you follow." : "No posts yet."}
                </p>
                <p className="text-sm">
                  {feedMode === "following"
                    ? "Follow some DJs or venues to see their posts here."
                    : "Be the first to share something!"}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {sortedPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </main>

          {/* RIGHT COLUMN — Chat Sidebar (lg+ only) */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <ChatSidebar />
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default SocialPage;
