import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

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

  useEffect(() => {
    checkAuth();
  }, []);

  // Wire up global message listener once authenticated + socket is ready
  useEffect(() => {
    if (authUser) {
      const socket = useAuthStore.getState().socket;
      if (socket) subscribeToGlobalMessages();
    }
  }, [authUser, subscribeToGlobalMessages]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin size-10" />
      </div>
    );
  }

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

      {/* Persistent chat popup — shown when logged in */}
      {authUser && (
        <>
          <ChatButton />
          <ChatPopup />
        </>
      )}

      <Toaster />
    </div>
  );
};

export default App;
