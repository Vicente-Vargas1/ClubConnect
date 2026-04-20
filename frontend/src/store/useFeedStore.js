import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useFeedStore = create((set, get) => ({
  posts: [],
  sortBy: "newest",
  isLoading: false,

  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/posts");
      set({ posts: res.data });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load posts");
    } finally {
      set({ isLoading: false });
    }
  },

  createPost: async (postData) => {
    try {
      const res = await axiosInstance.post("/posts", postData);
      set({ posts: [res.data, ...get().posts] });
      toast.success("Post created!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create post");
    }
  },

  likePost: async (postId) => {
    try {
      const res = await axiosInstance.put(`/posts/${postId}/like`);
      set({
        posts: get().posts.map((p) =>
          p._id === postId ? { ...p, likes: res.data.likes } : p
        ),
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to like post");
    }
  },

  addComment: async (postId, text) => {
    try {
      const res = await axiosInstance.post(`/posts/${postId}/comment`, { text });
      set({
        posts: get().posts.map((p) =>
          p._id === postId ? { ...p, comments: [...p.comments, res.data] } : p
        ),
      });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add comment");
    }
  },

  setSortBy: (sortBy) => set({ sortBy }),

  getSortedPosts: () => {
    const { posts, sortBy } = get();
    if (sortBy === "popular") {
      return [...posts].sort(
        (a, b) =>
          b.likes.length + b.comments.length - (a.likes.length + a.comments.length)
      );
    }
    return [...posts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },
}));
