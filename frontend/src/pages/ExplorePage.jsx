import { useEffect, useState } from "react";
import { Heart, Loader, MapPin, MessageCircle } from "lucide-react";
import { useSocialStore } from "../store/useSocialStore";
import MapView from "../components/MapView";
import vinylImage from "../assets/vinyl.png";

const ExplorePage = () => {
  const { posts, fetchPosts, isLoadingPosts } = useSocialStore();
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
        onClick={() => setSelectedPost(post)}
        style={{ minWidth: 160, cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <img
            src={post.userId?.profilePic || vinylImage}
            alt=""
            style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }}
          />
          <span style={{ fontWeight: 600, fontSize: 12 }}>{post.userId?.fullName}</span>
        </div>
        {post.text && (
          <p style={{ fontSize: 12, margin: 0 }}>
            {post.text.length > 80 ? post.text.slice(0, 80) + "…" : post.text}
          </p>
        )}
        {post.image && (
          <img
            src={post.image}
            alt=""
            style={{
              width: "100%",
              borderRadius: 6,
              marginTop: 4,
              maxHeight: 80,
              objectFit: "cover",
            }}
          />
        )}
      </div>
    ),
  }));

  const mapCenter =
    geotaggedPosts.length > 0
      ? [geotaggedPosts[0].location.lat, geotaggedPosts[0].location.lng]
      : [20, 0];
  const mapZoom = geotaggedPosts.length > 0 ? 5 : 2;

  return (
    <div className="min-h-screen bg-base-200 pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Explore</h1>
          <p className="text-base-content/50 text-sm mt-1">
            Discover club posts from around the world
          </p>
        </div>

        {isLoadingPosts ? (
          <div className="flex justify-center py-20">
            <Loader className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Map */}
            <div className="rounded-xl overflow-hidden border border-base-300 shadow-sm">
              <MapView
                center={mapCenter}
                zoom={mapZoom}
                markers={markers}
                style={{ height: "480px", width: "100%" }}
              />
            </div>

            {geotaggedPosts.length === 0 && (
              <p className="text-center text-base-content/50 text-sm py-4">
                No location-tagged posts yet — add a location when creating a post!
              </p>
            )}

            {/* Selected post detail */}
            {selectedPost && (
              <div className="bg-base-100 rounded-xl border border-base-300 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedPost.userId?.profilePic || vinylImage}
                      alt=""
                      className="size-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm">
                        {selectedPost.userId?.fullName}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-base-content/50">
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
                <div className="flex items-center gap-4 text-sm text-base-content/50 pt-1 border-t border-base-200">
                  <span className="flex items-center gap-1.5">
                    <Heart className="size-4" /> {selectedPost.likes?.length ?? 0}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="size-4" />{" "}
                    {selectedPost.comments?.length ?? 0}
                  </span>
                </div>
              </div>
            )}

            {/* Geotagged posts list */}
            {geotaggedPosts.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-base-content/50 mb-2">
                  {geotaggedPosts.length} location-tagged post
                  {geotaggedPosts.length !== 1 ? "s" : ""}
                </h2>
                <div className="grid gap-2">
                  {geotaggedPosts.map((post) => (
                    <button
                      key={post._id}
                      onClick={() =>
                        setSelectedPost(post === selectedPost ? null : post)
                      }
                      className={`text-left w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        selectedPost?._id === post._id
                          ? "bg-primary/10 border-primary"
                          : "bg-base-100 border-base-300 hover:bg-base-200"
                      }`}
                    >
                      <img
                        src={post.userId?.profilePic || vinylImage}
                        alt=""
                        className="size-9 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {post.userId?.fullName}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-base-content/50">
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
