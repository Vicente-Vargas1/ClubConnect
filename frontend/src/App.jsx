import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

import Navbar from "./components/Navbar";
import ChatButton from "./components/ChatButton";
import ChatPopup from "./components/ChatPopup";
import BottomNav from "./components/BottomNav";
import OnboardingModal from "./components/OnboardingModal";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import SocialPage from "./pages/SocialPage";
import ExplorePage from "./pages/ExplorePage";
import LandingPage from "./pages/LandingPage";

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useChatStore } from "./store/useChatStore";
import { useBookingStore } from "./store/useBookingStore";
import { useNotificationStore } from "./store/useNotificationStore";

const ONBOARDING_KEY = "cc_onboarded";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const { subscribeToGlobalMessages } = useChatStore();
  const { incrementUnread } = useNotificationStore();
  const location = useLocation();

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Show onboarding for new users
  useEffect(() => {
    if (authUser && !localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true);
    }
  }, [authUser]);

  const handleCloseOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setShowOnboarding(false);
  };

  // Wire up global message listener once authenticated + socket is ready
  useEffect(() => {
    if (authUser) {
      const socket = useAuthStore.getState().socket;
      if (socket) {
        subscribeToGlobalMessages();

        socket.on("bookingAccepted", (booking) => {
          const djName =
            booking.senderId?.role === "dj"
              ? booking.senderId?.fullName
              : booking.receiverId?.fullName;
          toast.success(
            `Booking accepted! ${djName} at ${booking.venueName} on ${new Date(booking.date).toLocaleDateString()}`,
            { duration: 5000 }
          );
          incrementUnread();
        });

        socket.on("djInterested", (data) => {
          toast(
            `${data.djName} is interested in your gig on ${new Date(data.postDate).toLocaleDateString()}!`,
            { duration: 5000, icon: "🎧" }
          );
          incrementUnread();
        });

        socket.on("newBookingRequest", (booking) => {
          const senderName = booking.senderId?.fullName;
          toast(
            `New booking request from ${senderName} for ${booking.venueName}`,
            { duration: 5000 }
          );
          useBookingStore.getState().fetchPendingCount();
          incrementUnread();
        });
      }
    }
  }, [authUser, subscribeToGlobalMessages, incrementUnread]);

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
      {authUser && <Navbar />}

      <Routes>
        {/* ROOT: landing for guests, feed for authed users */}
        <Route
          path="/"
          element={authUser ? <SocialPage /> : <LandingPage />}
        />

        <Route
          path="/chat"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />

        <Route
          path="/explore"
          element={authUser ? <ExplorePage /> : <Navigate to="/login" />}
        />

        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/settings"
          element={authUser ? <SettingsPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />

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

      {/* Mobile bottom nav */}
      {authUser && <BottomNav />}

      {/* Onboarding modal */}
      {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}

      <Toaster />
    </div>
  );
};

export default App;
