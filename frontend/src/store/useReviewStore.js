import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useReviewStore = create((set, get) => ({
  reviews: [],
  averageRating: 0,
  totalReviews: 0,
  isLoading: false,

  fetchReviews: async (userId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/reviews/${userId}`);
      set({
        reviews: res.data.reviews,
        averageRating: res.data.averageRating,
        totalReviews: res.data.totalReviews,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load reviews");
    } finally {
      set({ isLoading: false });
    }
  },

  submitReview: async (userId, { rating, text }) => {
    try {
      const res = await axiosInstance.post(`/reviews/${userId}`, { rating, text });
      // Refresh reviews after submit
      await get().fetchReviews(userId);
      toast.success("Review submitted!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  },

  deleteReview: async (userId) => {
    try {
      await axiosInstance.delete(`/reviews/${userId}`);
      await get().fetchReviews(userId);
      toast.success("Review deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
  },
}));
