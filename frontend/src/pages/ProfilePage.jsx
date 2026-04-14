import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";
import vinylImage from "../assets/vinyl.png";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">

          {/* HEADER */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>

            {/* ✅ ROLE BADGE */}
            {authUser?.role && (
              <span className="inline-block mt-3 px-3 py-1 rounded-full bg-purple-600 text-white text-sm">
                {authUser.role === "dj" ? "DJ Account" : "Venue Account"}
              </span>
            )}
          </div>

          {/* AVATAR */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || vinylImage}
                alt=""
                className="size-32 rounded-full object-cover"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>

            <p className="text-sm text-zinc-400">
              {isUpdatingProfile
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* BASIC INFO */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.fullName}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.email}
              </p>
            </div>
          </div>

          {/* ✅ ROLE-SPECIFIC PROFILE SECTION */}
          {authUser?.role === "dj" && authUser?.profile?.dj && (
            <div className="bg-base-200 p-4 rounded-lg space-y-3">
              <h2 className="text-lg font-semibold">DJ Profile</h2>

              <p><strong>Location:</strong> {authUser.profile.dj.location}</p>

              <p>
                <strong>Genres:</strong>{" "}
                {authUser.profile.dj.genres?.join(", ")}
              </p>

              {authUser.profile.dj.instagram && (
                <p><strong>Instagram:</strong> {authUser.profile.dj.instagram}</p>
              )}

              {authUser.profile.dj.soundcloud && (
                <p><strong>SoundCloud:</strong> {authUser.profile.dj.soundcloud}</p>
              )}

              {authUser.profile.dj.youtube && (
                <p><strong>YouTube:</strong> {authUser.profile.dj.youtube}</p>
              )}
            </div>
          )}

          {authUser?.role === "venue" && authUser?.profile?.venue && (
            <div className="bg-base-200 p-4 rounded-lg space-y-3">
              <h2 className="text-lg font-semibold">Venue Profile</h2>

              <p><strong>Location:</strong> {authUser.profile.venue.location}</p>

              <p><strong>Capacity:</strong> {authUser.profile.venue.capacity}</p>

              <p><strong>Type:</strong> {authUser.profile.venue.venueType}</p>

              {authUser.profile.venue.contactEmail && (
                <p><strong>Contact:</strong> {authUser.profile.venue.contactEmail}</p>
              )}

              {authUser.profile.venue.description && (
                <p><strong>Description:</strong> {authUser.profile.venue.description}</p>
              )}
            </div>
          )}

          {/* ACCOUNT INFO */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;