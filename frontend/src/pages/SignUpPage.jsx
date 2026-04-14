import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import djController from "../assets/dj-controller.png";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [role, setRole] = useState(null);
  const [profileData, setProfileData] = useState({});

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password)
      return toast.error("Password is required");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (!role) return toast.error("Select DJ or Venue account type");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();
    if (success === true) {
      signup({
        ...formData,
        role,
        profile: profileData,
      });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 gap-0">

      {/* LEFT SIDE */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-8 lg:p-10">
        <div className="w-full max-w-lg space-y-8">

          {/* HEADER */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="size-6 text-primary" />
              </div>

              <h1 className="text-2xl font-bold">Create Account</h1>
              <p className="text-base-content/60">
                Join Club Connect
              </p>
            </div>
          </div>

          {/* ROLE SELECT */}
          {!role && (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">
                Choose account type
              </h2>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setRole("dj")}
                  className="px-6 py-3 rounded-lg bg-purple-600 text-white"
                >
                  DJ
                </button>

                <button
                  onClick={() => setRole("venue")}
                  className="px-6 py-3 rounded-lg bg-blue-600 text-white"
                >
                  Venue
                </button>
              </div>
            </div>
          )}

          {/* FORM */}
          {role && (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* FULL NAME */}
              <input
                type="text"
                placeholder="Full Name"
                className="input input-bordered w-full"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />

              {/* EMAIL */}
              <input
                type="email"
                placeholder="Email"
                className="input input-bordered w-full"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              {/* PASSWORD */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="input input-bordered w-full pr-10"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {/* DJ FIELDS */}
              {role === "dj" && (
                <div className="space-y-3">
                  <input
                    placeholder="Location"
                    className="input input-bordered w-full"
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        location: e.target.value,
                      })
                    }
                  />

                  <input
                    placeholder="Genres (comma separated)"
                    className="input input-bordered w-full"
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        genres: e.target.value.split(","),
                      })
                    }
                  />

                  <input
                    placeholder="Instagram"
                    className="input input-bordered w-full"
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        instagram: e.target.value,
                      })
                    }
                  />

                  <input
                    placeholder="SoundCloud"
                    className="input input-bordered w-full"
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        soundcloud: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              {/* VENUE FIELDS */}
              {role === "venue" && (
                <div className="space-y-3">
                  <input
                    placeholder="Location"
                    className="input input-bordered w-full"
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        location: e.target.value,
                      })
                    }
                  />

                  <input
                    placeholder="Capacity"
                    type="number"
                    className="input input-bordered w-full"
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        capacity: e.target.value,
                      })
                    }
                  />

                  <input
                    placeholder="Venue Type"
                    className="input input-bordered w-full"
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        venueType: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isSigningUp}
                className="w-full py-3 rounded-lg bg-purple-600 text-white flex justify-center"
              >
                {isSigningUp ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}

          {/* LOGIN LINK */}
          <p className="text-center text-sm text-base-content/60">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-base-200">
        <h1 className="text-4xl font-bold mb-8">Club Connect</h1>

        <img
          src={djController}
          className="w-2/3 max-w-sm"
        />

        <p className="mt-6 text-center text-base-content/70">
          Booking DJs made simple
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;