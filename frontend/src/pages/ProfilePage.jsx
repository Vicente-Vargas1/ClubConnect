import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { Camera, Mail, User } from "lucide-react";
import vinylImage from "../assets/vinyl.png";

const ProfilePage = () => {
  const { id } = useParams();
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();

  const [selectedImg, setSelectedImg] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  const isOwnProfile = !id;

  const user = isOwnProfile ? authUser : viewUser;

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/auth/user/${id}`);
        setViewUser(res.data);
      } catch (err) {
        console.log("Error loading profile:", err);
      }
    };

    fetchUser();
  }, [id]);

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

  if (!user) return null;

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">

          {/* HEADER */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>

            <span className="inline-block mt-3 px-3 py-1 rounded-full bg-purple-600 text-white text-sm">
              {user.role === "dj" ? "DJ Account" : "Venue Account"}
            </span>
          </div>

          {/* AVATAR (only allow edit on own profile) */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || user.profilePic || vinylImage}
                className="size-32 rounded-full object-cover"
              />

              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 bg-base-content p-2 rounded-full cursor-pointer">
                  <Camera className="w-5 h-5 text-base-200" />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* BASIC INFO */}
          <div className="space-y-6">
            <div>
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2 bg-base-200 rounded-lg border">
                {user.fullName}
              </p>
            </div>

            <div>
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </div>
              <p className="px-4 py-2 bg-base-200 rounded-lg border">
                {user.email}
              </p>
            </div>
          </div>

          {/* DJ PROFILE */}
          {user.role === "dj" && user.profile?.dj && (
            <div className="bg-base-200 p-4 rounded-lg space-y-2">
              <h2 className="font-semibold">DJ Profile</h2>

              <p>Location: {user.profile.dj.location}</p>
              <p>Genres: {user.profile.dj.genres?.join(", ")}</p>
              <p>Instagram: {user.profile.dj.instagram}</p>
              <p>SoundCloud: {user.profile.dj.soundcloud}</p>
              <p>YouTube: {user.profile.dj.youtube}</p>
            </div>
          )}

          {/* VENUE PROFILE */}
          {user.role === "venue" && user.profile?.venue && (
            <div className="bg-base-200 p-4 rounded-lg space-y-2">
              <h2 className="font-semibold">Venue Profile</h2>

              <p>Location: {user.profile.venue.location}</p>
              <p>Capacity: {user.profile.venue.capacity}</p>
              <p>Type: {user.profile.venue.venueType}</p>
              <p>Email: {user.profile.venue.contactEmail}</p>
              <p>Description: {user.profile.venue.description}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;