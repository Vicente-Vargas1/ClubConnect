import { useEffect, useState, useRef } from "react";
import { Image, Loader, TrendingUp, Clock, MapPin, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useFeedStore } from "../store/useFeedStore";
import { useAuthStore } from "../store/useAuthStore";
import PostCard from "../components/PostCard";
import vinylImage from "../assets/vinyl.png";

// Fix leaflet default marker icons with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationPicker = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const FeedPage = () => {
  const { fetchPosts, createPost, sortBy, setSortBy, getSortedPosts, isLoading } =
    useFeedStore();
  const { authUser } = useAuthStore();

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [pickedLatLng, setPickedLatLng] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setImage(reader.result);
  };

  const handleRemoveLocation = () => {
    setShowLocationPicker(false);
    setLocationName("");
    setPickedLatLng(null);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    setIsPosting(true);

    const location =
      pickedLatLng && locationName
        ? { name: locationName, lat: pickedLatLng.lat, lng: pickedLatLng.lng }
        : undefined;

    await createPost({ text: text.trim(), image, location });
    setText("");
    setImage(null);
    handleRemoveLocation();
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsPosting(false);
  };

  const sortedPosts = getSortedPosts();

  return (
    <div className="min-h-screen bg-base-200 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Create Post card */}
        <div className="bg-base-100 rounded-xl border border-base-300 p-4">
          <form onSubmit={handlePost} className="space-y-3">
            <div className="flex items-start gap-3">
              <img
                src={authUser.profilePic || vinylImage}
                alt=""
                className="size-10 rounded-full object-cover flex-shrink-0"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's happening at your club?"
                className="textarea textarea-bordered flex-1 resize-none min-h-[80px] text-sm"
              />
            </div>

            {/* Image preview */}
            {image && (
              <div className="relative inline-block">
                <img
                  src={image}
                  alt="preview"
                  className="rounded-lg max-h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-1 right-1 btn btn-xs btn-circle btn-ghost bg-base-100/80"
                >
                  <X className="size-3" />
                </button>
              </div>
            )}

            {/* Location picker */}
            {showLocationPicker && (
              <div className="space-y-2 border border-base-300 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="Location name (e.g. UCLA Campus)"
                    className="input input-sm input-bordered flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLocation}
                    className="btn btn-xs btn-ghost"
                  >
                    <X className="size-3" />
                  </button>
                </div>
                <p className="text-xs text-zinc-400">Click on the map to drop a pin</p>
                <div className="h-40 rounded-lg overflow-hidden">
                  <MapContainer
                    center={pickedLatLng || [20, 0]}
                    zoom={pickedLatLng ? 13 : 2}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                    />
                    <LocationPicker onPick={setPickedLatLng} />
                    {pickedLatLng && <Marker position={pickedLatLng} />}
                  </MapContainer>
                </div>
                {pickedLatLng && (
                  <p className="text-xs text-zinc-400">
                    Pin: {pickedLatLng.lat.toFixed(4)}, {pickedLatLng.lng.toFixed(4)}
                  </p>
                )}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <label className="cursor-pointer btn btn-ghost btn-sm gap-2">
                  <Image className="size-4" />
                  <span className="hidden sm:inline">Photo</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
                {!showLocationPicker && (
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="btn btn-ghost btn-sm gap-2"
                  >
                    <MapPin className="size-4" />
                    <span className="hidden sm:inline">Location</span>
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isPosting || (!text.trim() && !image)}
                className="btn btn-primary btn-sm"
              >
                {isPosting ? <Loader className="size-4 animate-spin" /> : "Post"}
              </button>
            </div>
          </form>
        </div>

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

        {/* Posts list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="size-8 animate-spin text-primary" />
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="text-center text-zinc-400 py-12">
            No posts yet — be the first to post!
          </div>
        ) : (
          sortedPosts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default FeedPage;
