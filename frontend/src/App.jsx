import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

import Navbar from "./components/Navbar";
import ChatButton from "./components/ChatButton";
import ChatPopup from "./components/ChatPopup";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import SocialPage from "./pages/SocialPage";
import ExplorePage from "./pages/ExplorePage";

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useChatStore } from "./store/useChatStore";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const { subscribeToGlobalMessages } = useChatStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  // Wire up global message listener once authenticated + socket is ready
  useEffect(() => {
    if (authUser) {
      const socket = useAuthStore.getState().socket;
      if (socket) {
        subscribeToGlobalMessages();

        // Real-time booking accepted notification
        socket.on("bookingAccepted", (booking) => {
          const djName =
            booking.senderId?.role === "dj"
              ? booking.senderId?.fullName
              : booking.receiverId?.fullName;
          toast.success(
            `Booking accepted! ${djName} at ${booking.venueName} on ${new Date(booking.date).toLocaleDateString()}`,
            { duration: 5000 }
          );
        });

        // Real-time DJ interest notification
        socket.on("djInterested", (data) => {
          toast(
            `🎧 ${data.djName} is interested in your gig on ${new Date(data.postDate).toLocaleDateString()}!`,
            { duration: 5000, icon: "🎧" }
          );
        });

        // Real-time new booking request notification
        socket.on("newBookingRequest", (booking) => {
          const senderName = booking.senderId?.fullName;
          toast(
            `📅 New booking request from ${senderName} for ${booking.venueName}`,
            { duration: 5000 }
          );
        });
      }
    }
  }, [authUser, subscribeToGlobalMessages]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin size-10" />
      </div>
    );
  }

  const isSocialPage = location.pathname === "/";

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        {/* SOCIAL FEED HOME */}
        <Route
          path="/"
          element={authUser ? <SocialPage /> : <Navigate to="/login" />}
        />

        {/* CHAT PAGE */}
        <Route
          path="/chat"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />

        {/* EXPLORE MAP */}
        <Route
          path="/explore"
          element={authUser ? <ExplorePage /> : <Navigate to="/login" />}
        />

        {/* AUTH */}
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* SETTINGS */}
        <Route
          path="/settings"
          element={authUser ? <SettingsPage /> : <Navigate to="/login" />}
        />

        {/* PROFILE (SELF) */}
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />

        {/* PROFILE (OTHER USERS) */}
        <Route
          path="/profile/:id"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>

      {/* Persistent chat popup — hidden on SocialPage (has sidebar instead) */}
      {authUser && (
        <>
          {!isSocialPage && <ChatButton />}
          <ChatPopup />
        </>
      )}

      <Toaster />
    </div>
  );
};

export default App;
