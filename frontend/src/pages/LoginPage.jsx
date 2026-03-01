import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

// Optional: replace with your own image
import loginImage from "../assets/dj-controller.png";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, isLoggingIn } = useAuthStore();

  const validateForm = () => {
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm() === true) login(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 gap-0">

      {/* LEFT SIDE - FORM */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-8 lg:p-10">
        <div className="w-full max-w-lg space-y-10">

          {/* LOGO / HEADER */}
          <div className="text-center mb-6">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center 
                group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-1">Welcome Back</h1>
              <p className="text-base-content/60">Sign in to your account</p>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* EMAIL */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input input-bordered w-full pl-10"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-base-content/40" /> : <Eye className="w-5 h-5 text-base-content/40" />}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg text-white font-semibold bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* SIGN UP LINK */}
          <div className="text-center">
            <p className="text-base-content/60">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-purple-600 hover:text-purple-700">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - IMAGE / PATTERN */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-base-200 p-4 relative">
        <h1 className="text-4xl font-extrabold mb-6 text-center" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Club Connect
        </h1>
        <img
          src={loginImage}
          alt="Login Illustration"
          className="w-2/3 max-w-sm object-contain rounded-xl drop-shadow-xl"
        />
        <h2 className="text-3xl font-bold mt-4 text-center">Welcome Back!</h2>
        <p className="text-base-content/70 text-center mt-2 max-w-sm">
          Sign in to continue your conversations and catch up with your messages.
        </p>
      </div>

    </div>
  );
};

export default LoginPage;
