import { useEffect, useState } from "react";
import { MapPin, Heart, MessageCircle, Loader } from "lucide-react";
import { useFeedStore } from "../store/useFeedStore";
import MapView from "../components/MapView";
import vinylImage from "../assets/vinyl.png";

const ExplorePage = () => {
  const { posts, fetchPosts, isLoading } = useFeedStore();
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    if (posts.length === 0) fetchPosts();
  }, [fetchPosts, posts.length]);

  const geotaggedPosts = posts.filter(
    (p) => p.location?.lat != null && p.location?.lng != null
  );

  const markers = geotaggedPosts.map((post) => ({
    id: post._id,
    lat: post.location.lat,
    lng: post.location.lng,
    title: post.location.name || "Post",
    popupContent: (
      <div
        className="cursor-pointer"
        onClick={() => setSelectedPost(post)}
        style={{ minWidth: 160 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <img
            src={post.authorId?.profilePic || vinylImage}
            alt=""
            style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }}
          />
          <span style={{ fontWeight: 600, fontSize: 12 }}>{post.authorId?.fullName}</span>
        </div>
        {post.text && (
          <p style={{ fontSize: 12, margin: 0, maxWidth: 160, whiteSpace: "pre-wrap" }}>
            {post.text.length > 80 ? post.text.slice(0, 80) + "…" : post.text}
          </p>
        )}
        {post.image && (
          <img
            src={post.image}
            alt=""
            style={{ width: "100%", borderRadius: 6, marginTop: 4, maxHeight: 80, objectFit: "cover" }}
          />
        )}
      </div>
    ),
  }));

  // Default center: if there are geotagged posts use first one, else world view
  const center =
    geotaggedPosts.length > 0
      ? [geotaggedPosts[0].location.lat, geotaggedPosts[0].location.lng]
      : [20, 0];
  const zoom = geotaggedPosts.length > 0 ? 5 : 2;

  return (
    <div className="min-h-screen bg-base-200 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Explore</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Discover club posts from around the world
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="rounded-xl overflow-hidden border border-base-300 shadow-sm">
              <MapView
                center={center}
                zoom={zoom}
                markers={markers}
                style={{ height: "480px", width: "100%" }}
              />
            </div>

            {geotaggedPosts.length === 0 && (
              <p className="text-center text-zinc-400 py-4 text-sm">
                No location-tagged posts yet. Add a location when creating a post on the Feed!
              </p>
            )}

            {/* Selected post detail */}
            {selectedPost && (
              <div className="bg-base-100 rounded-xl border border-base-300 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedPost.authorId?.profilePic || vinylImage}
                      alt=""
                      className="size-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm">{selectedPost.authorId?.fullName}</p>
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <MapPin className="size-3" />
                        {selectedPost.location.name}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="btn btn-ghost btn-xs btn-circle"
                  >
                    ✕
                  </button>
                </div>
                {selectedPost.text && (
                  <p className="text-sm leading-relaxed">{selectedPost.text}</p>
                )}
                {selectedPost.image && (
                  <img
                    src={selectedPost.image}
                    alt=""
                    className="w-full rounded-lg object-cover max-h-72"
                  />
                )}
                <div className="flex items-center gap-4 text-sm text-zinc-400 pt-1 border-t border-base-300">
                  <span className="flex items-center gap-1.5">
                    <Heart className="size-4" /> {selectedPost.likes.length}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="size-4" /> {selectedPost.comments.length}
                  </span>
                </div>
              </div>
            )}

            {/* List of geotagged posts */}
            {geotaggedPosts.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-400 mb-2">
                  {geotaggedPosts.length} location-tagged post{geotaggedPosts.length !== 1 ? "s" : ""}
                </h2>
                <div className="grid gap-2">
                  {geotaggedPosts.map((post) => (
                    <button
                      key={post._id}
                      onClick={() => setSelectedPost(post === selectedPost ? null : post)}
                      className={`text-left w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        selectedPost?._id === post._id
                          ? "bg-primary/10 border-primary"
                          : "bg-base-100 border-base-300 hover:bg-base-200"
                      }`}
                    >
                      <img
                        src={post.authorId?.profilePic || vinylImage}
                        alt=""
                        className="size-9 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {post.authorId?.fullName}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                          <MapPin className="size-3" />
                          <span className="truncate">{post.location.name}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
