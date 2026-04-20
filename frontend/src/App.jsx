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
import FeedPage from "./pages/FeedPage";
import ExplorePage from "./pages/ExplorePage";

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useChatStore } from "./store/useChatStore";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();
  const { subscribeToGlobalMessages } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Wire up global message listener once socket is ready
  useEffect(() => {
    if (authUser) {
      const socket = useAuthStore.getState().socket;
      if (socket) subscribeToGlobalMessages();
    }
  }, [authUser, subscribeToGlobalMessages]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/feed" element={authUser ? <FeedPage /> : <Navigate to="/login" />} />
        <Route path="/explore" element={authUser ? <ExplorePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      {/* Persistent chat popup — only shown when logged in */}
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
