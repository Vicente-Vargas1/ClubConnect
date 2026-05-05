import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/notifications");
      const notifications = res.data;
      const unreadCount = notifications.filter((n) => !n.read).length;
      set({ notifications, unreadCount });
    } catch {
      // silently fail
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await axiosInstance.get("/notifications/unread-count");
      set({ unreadCount: res.data.count });
    } catch {
      // silently fail
    }
  },

  markAllRead: async () => {
    try {
      await axiosInstance.put("/notifications/mark-all-read");
      set({
        notifications: get().notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      });
    } catch {
      // silently fail
    }
  },

  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
}));
