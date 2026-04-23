import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

// Named ref so unsubscribeFromMessages only removes its own listener
let chatMessageHandler = null;

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  recentContacts: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Popup state
  isPopupOpen: false,
  popupSelectedUser: null,
  popupMessages: [],
  isPopupMessagesLoading: false,
  pendingPopupMessage: null,

  // Unread tracking
  unreadCounts: {}, // { userId: number }
  totalUnread: 0,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getRecentContacts: async () => {
    try {
      const res = await axiosInstance.get("/messages/recent-contacts");
      set({ recentContacts: res.data, users: res.data });
    } catch (error) {
      console.error("Failed to load recent contacts");
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    chatMessageHandler = (newMessage) => {
      if (newMessage.senderId !== get().selectedUser?._id) return;
      set({ messages: [...get().messages, newMessage] });
    };

    socket.on("newMessage", chatMessageHandler);
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (chatMessageHandler) {
      socket.off("newMessage", chatMessageHandler);
      chatMessageHandler = null;
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  // ── Popup actions ──────────────────────────────────────────────────────────

  togglePopup: () => set((s) => ({ isPopupOpen: !s.isPopupOpen })),
  closePopup: () => set({ isPopupOpen: false, popupSelectedUser: null, popupMessages: [] }),

  setPopupSelectedUser: async (user) => {
    const { unreadCounts } = get();
    const newUnread = { ...unreadCounts };
    delete newUnread[user._id];
    const totalUnread = Object.values(newUnread).reduce((s, c) => s + c, 0);

    set({
      popupSelectedUser: user,
      popupMessages: [],
      unreadCounts: newUnread,
      totalUnread,
      isPopupMessagesLoading: true,
    });

    try {
      const res = await axiosInstance.get(`/messages/${user._id}`);
      set({ popupMessages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isPopupMessagesLoading: false });
    }
  },

  sendPopupMessage: async (messageData) => {
    const { popupSelectedUser, popupMessages } = get();
    if (!popupSelectedUser) return;
    try {
      const res = await axiosInstance.post(
        `/messages/send/${popupSelectedUser._id}`,
        messageData
      );
      set({ popupMessages: [...popupMessages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  // Call once after socket connects — handles popup delivery + unread badges
  clearPendingPopupMessage: () => set({ pendingPopupMessage: null }),

  subscribeToGlobalMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const { popupSelectedUser, popupMessages, selectedUser, unreadCounts } = get();

      // Deliver to open popup chat
      if (popupSelectedUser && newMessage.senderId === popupSelectedUser._id) {
        set({ popupMessages: [...popupMessages, newMessage] });
        return;
      }

      // Already handled by the full-page chat handler
      if (selectedUser && newMessage.senderId === selectedUser._id) return;

      // Track as unread
      const newUnread = {
        ...unreadCounts,
        [newMessage.senderId]: (unreadCounts[newMessage.senderId] || 0) + 1,
      };
      set({
        unreadCounts: newUnread,
        totalUnread: Object.values(newUnread).reduce((s, c) => s + c, 0),
      });
    });
  },
}));
