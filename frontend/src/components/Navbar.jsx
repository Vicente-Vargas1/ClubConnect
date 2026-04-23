import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useBookingStore } from "../store/useBookingStore";
import { useChatStore } from "../store/useChatStore";
import {
  LogOut,
  MessageSquare,
  Settings,
  User,
  LayoutGrid,
  MessageCircle,
  Map,
} from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { pendingCount, fetchPendingCount } = useBookingStore();
  const { totalUnread } = useChatStore();

  useEffect(() => {
    if (authUser) fetchPendingCount();
  }, [authUser, fetchPendingCount]);

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

            {/* 💬 CHAT BUTTON */}
            {authUser && (
              <Link to="/chat" className="btn btn-sm gap-2 transition-colors relative">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 size-5 rounded-full bg-error text-error-content text-xs font-bold flex items-center justify-center">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </Link>
            )}

            {/* 🗺️ EXPLORE MAP */}
            {authUser && (
              <Link to="/explore" className="btn btn-sm gap-2 transition-colors">
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Explore</span>
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
                <Link to="/profile" className="btn btn-sm gap-2 relative">
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 size-5 rounded-full bg-error text-error-content text-xs font-bold flex items-center justify-center">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                </Link>

                <button
                  className="btn btn-sm gap-2 transition-colors"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
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