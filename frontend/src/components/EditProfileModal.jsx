import { useState, useRef } from "react";
import { X, Loader2, Music } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const EditProfileModal = ({ onClose }) => {
  const { authUser, updateProfileData, isUpdatingProfile } = useAuthStore();
  const isDJ = authUser?.role === "dj";
  const djProfile = authUser?.profile?.dj || {};
  const venueProfile = authUser?.profile?.venue || {};
  const audioInputRef = useRef(null);

  const [form, setForm] = useState(
    isDJ
      ? {
          bio: djProfile.bio || "",
          location: djProfile.location || "",
          genres: djProfile.genres?.join(", ") || "",
          instagram: djProfile.instagram || "",
          soundcloud: djProfile.soundcloud || "",
          availableForBookings: djProfile.availableForBookings || false,
          audioPreview: "",
        }
      : {
          description: venueProfile.description || "",
          location: venueProfile.location || "",
          capacity: venueProfile.capacity || "",
          venueType: venueProfile.venueType || "",
          contactEmail: venueProfile.contactEmail || "",
        }
  );
  const [audioFileName, setAudioFileName] = useState("");

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Audio file must be under 15MB");
      return;
    }
    setAudioFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => set("audioPreview", reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = isDJ
      ? {
          ...form,
          genres: form.genres
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean),
        }
      : form;

    const ok = await updateProfileData(payload);
    if (ok) {
      toast.success("Profile updated!");
      onClose();
    } else {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-base-100 rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 pt-5 pb-3 border-b border-base-200">
          <h3 className="font-bold text-lg">Edit Profile</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {isDJ ? (
            <>
              <div>
                <label className="label label-text text-sm font-medium">Bio</label>
                <textarea
                  className="textarea textarea-bordered w-full text-sm resize-none"
                  rows={3}
                  placeholder="Tell the world about your DJ style…"
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                />
              </div>
              <div>
                <label className="label label-text text-sm font-medium">Location</label>
                <input
                  className="input input-bordered w-full text-sm"
                  placeholder="e.g. Brisbane, QLD"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                />
              </div>
              <div>
                <label className="label label-text text-sm font-medium">Genres</label>
                <input
                  className="input input-bordered w-full text-sm"
                  placeholder="House, Techno, Drum & Bass"
                  value={form.genres}
                  onChange={(e) => set("genres", e.target.value)}
                />
                <p className="text-xs text-base-content/50 mt-1">Comma-separated</p>
              </div>
              <div>
                <label className="label label-text text-sm font-medium">Instagram URL</label>
                <input
                  className="input input-bordered w-full text-sm"
                  placeholder="https://instagram.com/yourprofile"
                  value={form.instagram}
                  onChange={(e) => set("instagram", e.target.value)}
                />
              </div>
              <div>
                <label className="label label-text text-sm font-medium">SoundCloud URL</label>
                <input
                  className="input input-bordered w-full text-sm"
                  placeholder="https://soundcloud.com/yourprofile"
                  value={form.soundcloud}
                  onChange={(e) => set("soundcloud", e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between bg-base-200 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Available for bookings</p>
                  <p className="text-xs text-base-content/50">Show venues you're open to new gigs</p>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-success toggle-sm"
                  checked={form.availableForBookings}
                  onChange={(e) => set("availableForBookings", e.target.checked)}
                />
              </div>
              <div>
                <label className="label label-text text-sm font-medium">Set Preview (audio)</label>
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  className="btn btn-ghost btn-sm border w-full gap-2 justify-start"
                >
                  <Music className="size-4" />
                  {audioFileName ? audioFileName : (djProfile.audioPreview ? "Replace current preview" : "Upload MP3 or WAV (max 15MB)")}
                </button>
                <input
                  type="file"
                  accept="audio/*"
                  ref={audioInputRef}
                  onChange={handleAudioChange}
                  className="hidden"
                />
                {djProfile.audioPreview && !audioFileName && (
                  <div className="mt-2">
                    <audio controls src={djProfile.audioPreview} className="w-full h-9" />
                  </div>
                )}
                {audioFileName && (
                  <p className="text-xs text-success mt-1">New file selected — will upload on save</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="label label-text text-sm font-medium">Description</label>
                <textarea
                  className="textarea textarea-bordered w-full text-sm resize-none"
                  rows={3}
                  placeholder="Tell DJs about your venue…"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
              <div>
                <label className="label label-text text-sm font-medium">Location</label>
                <input
                  className="input input-bordered w-full text-sm"
                  placeholder="e.g. 123 Main St, Brisbane"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label label-text text-sm font-medium">Capacity</label>
                  <input
                    type="number"
                    className="input input-bordered w-full text-sm"
                    placeholder="500"
                    value={form.capacity}
                    onChange={(e) => set("capacity", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label label-text text-sm font-medium">Venue Type</label>
                  <input
                    className="input input-bordered w-full text-sm"
                    placeholder="Nightclub, Bar…"
                    value={form.venueType}
                    onChange={(e) => set("venueType", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="label label-text text-sm font-medium">Contact Email</label>
                <input
                  type="email"
                  className="input input-bordered w-full text-sm"
                  placeholder="bookings@yourvenue.com"
                  value={form.contactEmail}
                  onChange={(e) => set("contactEmail", e.target.value)}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="btn btn-primary w-full mt-2"
          >
            {isUpdatingProfile ? (
              <><Loader2 className="size-4 animate-spin" /> Saving…</>
            ) : (
              "Save changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
