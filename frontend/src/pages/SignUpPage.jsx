import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";


// import DJ controller image
import djController from "../assets/dj-controller.png";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) signup(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 gap-0">
      
      {/* LEFT SIDE */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-8 lg:p-10">
        <div className="w-full max-w-lg space-y-10">
          
          {/* LOGO / HEADER */}
          <div className="text-center mb-6">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
                group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-1">Create Account</h1>
              <p className="text-base-content/60">Get started with your free account</p>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="input input-bordered w-full pl-10"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
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
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

           {/* SUBMIT BUTTON */}
<button
  type="submit"
  className="w-full py-3 px-4 rounded-lg text-white font-semibold bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
  disabled={isSigningUp}
>
  {isSigningUp ? (
    <>
      <Loader2 className="size-5 animate-spin" />
      Loading...
    </>
  ) : (
    "Create Account"
  )}
</button>

          </form>

        {/* SIGN IN LINK */}
<div className="text-center">
  <p className="text-base-content/60">
    Already have an account?{" "}
    <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-700">
      Sign in
    </Link>
  </p>
</div>

        </div>
      </div>

{/* RIGHT SIDE */}

<div className="hidden lg:flex flex-col items-center justify-center bg-base-200 p-2 relative">
  
  {/* App Title / Logo */}
  <h1
    className="text-4xl font-extrabold mb-15 text-center"
    style={{ fontFamily: "'Orbitron', sans-serif" }}
  >
    Club Connect
  </h1>

  <img
    src={djController}
    alt="DJ Controller"
    className="w-2/3 max-w-sm object-contain rounded-xl drop-shadow-xl"
  />

  <h2 className="text-3xl font-bold mt-0 text-center">
    Join our community
  </h2>

  <p className="text-base-content/70 text-center mt-4 max-w-sm">
    Booking DJ's made simple.
  </p>
</div>

    </div>
  );
};

export default SignUpPage;
