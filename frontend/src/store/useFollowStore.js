import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";

export const useFollowStore = create((set, get) => ({
  followingList: [],
  followersList: [],
  isLoading: false,

  toggleFollow: async (userId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.put(`/follow/${userId}`);
      // Update authUser's following list in the auth store
      const authUser = useAuthStore.getState().authUser;
      useAuthStore.setState({
        authUser: {
          ...authUser,
          following: res.data.following,
          followers: res.data.followers,
        },
      });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update follow");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFollowers: async (userId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/follow/${userId}/followers`);
      set({ followersList: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load followers");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFollowing: async (userId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/follow/${userId}/following`);
      set({ followingList: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load following");
    } finally {
      set({ isLoading: false });
    }
  },
}));
