import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

// kept here so unsubscribe removes only this listener, not all newMessage listeners
let chatMessageHandler = null;

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  recentContacts: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  isPopupOpen: false,
  popupSelectedUser: null,
  popupMessages: [],
  isPopupMessagesLoading: false,
  pendingPopupMessage: null,

  unreadCounts: {},
  totalUnread: 0,

  typingUsers: {},

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

  setSelectedUser: (user) => {
    if (user) {
      const { unreadCounts } = get();
      const newUnread = { ...unreadCounts };
      delete newUnread[user._id];
      set({
        selectedUser: user,
        unreadCounts: newUnread,
        totalUnread: Object.values(newUnread).reduce((s, c) => s + c, 0),
      });
    } else {
      set({ selectedUser: user });
    }
  },

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

  sendTyping: (toUserId) => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.emit("typing", { to: toUserId });
  },

  stopTyping: (toUserId) => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.emit("stopTyping", { to: toUserId });
  },

  clearPendingPopupMessage: () => set({ pendingPopupMessage: null }),

  subscribeToGlobalMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const { popupSelectedUser, popupMessages, selectedUser, unreadCounts } = get();

      if (popupSelectedUser && newMessage.senderId === popupSelectedUser._id) {
        set({ popupMessages: [...popupMessages, newMessage] });
        return;
      }

      if (selectedUser && newMessage.senderId === selectedUser._id) return;

      const newUnread = {
        ...unreadCounts,
        [newMessage.senderId]: (unreadCounts[newMessage.senderId] || 0) + 1,
      };
      set({
        unreadCounts: newUnread,
        totalUnread: Object.values(newUnread).reduce((s, c) => s + c, 0),
      });
    });

    socket.on("typing", ({ from }) => {
      set((s) => ({ typingUsers: { ...s.typingUsers, [from]: true } }));
    });

    socket.on("stopTyping", ({ from }) => {
      set((s) => {
        const next = { ...s.typingUsers };
        delete next[from];
        return { typingUsers: next };
      });
    });

    socket.on("messagesRead", ({ by }) => {
      const { popupMessages } = get();
      set({
        popupMessages: popupMessages.map((m) => {
          const receiverId = typeof m.receiverId === "object" ? m.receiverId?.toString() : m.receiverId;
          return receiverId === by ? { ...m, read: true } : m;
        }),
      });
    });
  },
}));
