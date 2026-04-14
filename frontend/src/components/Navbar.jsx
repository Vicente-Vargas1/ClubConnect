import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  LogOut,
  MessageSquare,
  Settings,
  User,
  LayoutGrid,
  MessageCircle,
} from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">

      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">

          {/* LEFT - LOGO */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">ClubConnect</h1>
            </Link>
          </div>

          {/* RIGHT - NAV BUTTONS */}
          <div className="flex items-center gap-2">

            {/* FEED / SOCIAL (now main page) */}
            {authUser && (
              <Link to="/" className="btn btn-sm gap-2 transition-colors">
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Feed</span>
              </Link>
            )}

            {/* 💬 CHAT BUTTON (NEW) */}
            {authUser && (
              <Link to="/chat" className="btn btn-sm gap-2 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </Link>
            )}

            {/* SETTINGS */}
            <Link to="/settings" className="btn btn-sm gap-2 transition-colors">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {/* AUTHED ONLY */}
            {authUser && (
              <>
                <Link to="/profile" className="btn btn-sm gap-2">
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button
                  className="flex gap-2 items-center"
                  onClick={logout}
                >
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;