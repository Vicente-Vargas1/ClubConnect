import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useSocialStore = create((set, get) => ({
  posts: [],
  sortBy: "newest", // "newest" | "popular"
  feedMode: "all", // "all" | "following"
  isLoadingPosts: false,
  isCreatingPost: false,

  fetchPosts: async () => {
    set({ isLoadingPosts: true });
    try {
      const res = await axiosInstance.get("/posts");
      set({ posts: res.data, feedMode: "all" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load posts");
    } finally {
      set({ isLoadingPosts: false });
    }
  },

  fetchFollowingPosts: async () => {
    set({ isLoadingPosts: true });
    try {
      const res = await axiosInstance.get("/posts/following");
      set({ posts: res.data, feedMode: "following" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load following feed");
    } finally {
      set({ isLoadingPosts: false });
    }
  },

  createPost: async ({ text, image, location, postType, lookingForDJ }) => {
    set({ isCreatingPost: true });
    try {
      const res = await axiosInstance.post("/posts", { text, image, location, postType, lookingForDJ });
      set({ posts: [res.data, ...get().posts] });
      toast.success("Post created!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      set({ isCreatingPost: false });
    }
  },

  toggleLike: async (postId) => {
    try {
      const res = await axiosInstance.put(`/posts/${postId}/like`);
      set({
        posts: get().posts.map((p) =>
          p._id === postId ? { ...p, likes: res.data.likes } : p,
        ),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to like post");
    }
  },

  addComment: async (postId, text) => {
    try {
      const res = await axiosInstance.post(`/posts/${postId}/comment`, {
        text,
      });
      set({
        posts: get().posts.map((p) =>
          p._id === postId ? { ...p, comments: [...p.comments, res.data] } : p,
        ),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  },

  deletePost: async (postId) => {
    try {
      await axiosInstance.delete(`/posts/${postId}`);
      set({ posts: get().posts.filter((p) => p._id !== postId) });
      toast.success("Post deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete post");
    }
  },

  updatePostInterested: (postId, interestedUsers) => {
    set({
      posts: get().posts.map((p) =>
        p._id === postId
          ? { ...p, lookingForDJ: { ...p.lookingForDJ, interestedUsers } }
          : p
      ),
    });
  },

  setSortBy: (sortBy) => set({ sortBy }),

  getSortedPosts: () => {
    const { posts, sortBy } = get();
    if (sortBy === "popular") {
      return [...posts].sort(
        (a, b) =>
          (b.likes.length + b.comments.length) -
          (a.likes.length + a.comments.length)
      );
    }
    return [...posts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },
}));
