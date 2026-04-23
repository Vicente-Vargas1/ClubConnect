import { useRef, useState } from "react";
import { Image, MapPin, X, Music } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import { useSocialStore } from "../store/useSocialStore";
import { useAuthStore } from "../store/useAuthStore";
import vinylImage from "../assets/vinyl.png";

// Fix default marker icons for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationPicker = ({ onPick }) => {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
};

const CreatePost = () => {
  const { authUser } = useAuthStore();
  const { createPost, isCreatingPost } = useSocialStore();

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [pickedLatLng, setPickedLatLng] = useState(null);
  const fileInputRef = useRef(null);

  // Looking for DJ mode (venue only)
  const [isLookingForDJ, setIsLookingForDJ] = useState(false);
  const [djForm, setDjForm] = useState({
    date: "",
    time: "",
    venueName: "",
    pay: "",
    genre: "",
    eventDescription: "",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeLocation = () => {
    setShowLocationPicker(false);
    setLocationName("");
    setPickedLatLng(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLookingForDJ) {
      if (!djForm.date || !djForm.venueName) {
        toast.error("Date and venue name are required");
        return;
      }
      await createPost({
        text: text.trim(),
        image: imagePreview,
        location: pickedLatLng && locationName.trim()
          ? { name: locationName.trim(), lat: pickedLatLng.lat, lng: pickedLatLng.lng }
          : undefined,
        postType: "lookingForDJ",
        lookingForDJ: djForm,
      });
    } else {
      if (!text.trim() && !imagePreview) {
        toast.error("Add some text or an image");
        return;
      }
      const location =
        pickedLatLng && locationName.trim()
          ? { name: locationName.trim(), lat: pickedLatLng.lat, lng: pickedLatLng.lng }
          : undefined;
      await createPost({ text: text.trim(), image: imagePreview, location });
    }

    setText("");
    setImagePreview(null);
    removeLocation();
    setIsLookingForDJ(false);
    setDjForm({ date: "", time: "", venueName: "", pay: "", genre: "", eventDescription: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-base-100 rounded-xl shadow border border-base-300 w-full max-w-xl mx-auto p-4">
      <div className="flex gap-3 items-start">
        <img
          src={authUser?.profilePic || vinylImage}
          alt="profile"
          className="size-10 rounded-full object-cover border border-base-300 flex-shrink-0"
        />
        <form onSubmit={handleSubmit} className="flex-1 space-y-3">

          {/* Looking for DJ toggle (venue only) */}
          {authUser?.role === "venue" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLookingForDJ((v) => !v)}
                className={`btn btn-xs gap-1.5 ${isLookingForDJ ? "btn-secondary" : "btn-ghost border"}`}
              >
                <Music className="size-3.5" />
                Looking for a DJ?
              </button>
            </div>
          )}

          {/* Looking for DJ fields */}
          {isLookingForDJ && (
            <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide">DJ Booking Request</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-base-content/60">Date *</label>
                  <input
                    type="date"
                    className="input input-bordered input-sm w-full"
                    value={djForm.date}
                    onChange={(e) => setDjForm({ ...djForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-base-content/60">Time</label>
                  <input
                    type="time"
                    className="input input-bordered input-sm w-full"
                    value={djForm.time}
                    onChange={(e) => setDjForm({ ...djForm, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-base-content/60">Venue Name *</label>
                <input
                  type="text"
                  placeholder="Venue name"
                  className="input input-bordered input-sm w-full"
                  value={djForm.venueName}
                  onChange={(e) => setDjForm({ ...djForm, venueName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-base-content/60">Pay</label>
                  <input
                    type="text"
                    placeholder="e.g. $500"
                    className="input input-bordered input-sm w-full"
                    value={djForm.pay}
                    onChange={(e) => setDjForm({ ...djForm, pay: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-base-content/60">Genre / Style</label>
                  <input
                    type="text"
                    placeholder="e.g. House, Techno"
                    className="input input-bordered input-sm w-full"
                    value={djForm.genre}
                    onChange={(e) => setDjForm({ ...djForm, genre: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-base-content/60">Event Description</label>
                <textarea
                  placeholder="Tell DJs about the event…"
                  rows={2}
                  className="textarea textarea-bordered textarea-sm w-full resize-none"
                  value={djForm.eventDescription}
                  onChange={(e) => setDjForm({ ...djForm, eventDescription: e.target.value })}
                />
              </div>
            </div>
          )}

          {!isLookingForDJ && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              rows={2}
              className="textarea textarea-bordered w-full resize-none text-sm"
            />
          )}

          {isLookingForDJ && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Additional details… (optional)"
              rows={1}
              className="textarea textarea-bordered w-full resize-none text-sm"
            />
          )}

          {/* Image preview */}
          {imagePreview && (
            <div className="relative w-full">
              <img
                src={imagePreview}
                alt="preview"
                className="w-full max-h-60 object-cover rounded-lg border border-base-300"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1.5 right-1.5 btn btn-circle btn-xs bg-base-300"
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
                  onClick={removeLocation}
                  className="btn btn-xs btn-ghost btn-circle"
                >
                  <X className="size-3" />
                </button>
              </div>
              <p className="text-xs text-base-content/50">Click on the map to drop a pin</p>
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
                <p className="text-xs text-base-content/40">
                  Pin: {pickedLatLng.lat.toFixed(4)}, {pickedLatLng.lng.toFixed(4)}
                </p>
              )}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-ghost btn-sm gap-1.5 text-base-content/60"
              >
                <Image className="size-4" />
                <span className="text-xs">Photo</span>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
              {!showLocationPicker && (
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="btn btn-ghost btn-sm gap-1.5 text-base-content/60"
                >
                  <MapPin className="size-4" />
                  <span className="text-xs">Location</span>
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isCreatingPost}
              className="btn btn-primary btn-sm"
            >
              {isCreatingPost ? "Posting…" : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
