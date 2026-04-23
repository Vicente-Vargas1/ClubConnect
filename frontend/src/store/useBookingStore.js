import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useBookingStore = create((set, get) => ({
  bookings: [],
  upcomingBookings: [],
  pendingCount: 0,
  isLoading: false,

  createBooking: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/bookings", data);
      toast.success("Booking request sent!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send booking request");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyBookings: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/bookings/mine");
      set({ bookings: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPendingCount: async () => {
    try {
      const res = await axiosInstance.get("/bookings/pending-count");
      set({ pendingCount: res.data.count });
    } catch (error) {
      console.error("Failed to fetch pending count");
    }
  },

  fetchUpcomingBookings: async () => {
    try {
      const res = await axiosInstance.get("/bookings/upcoming");
      set({ upcomingBookings: res.data });
    } catch (error) {
      console.error("Failed to load upcoming bookings");
    }
  },

  acceptBooking: async (id) => {
    try {
      const res = await axiosInstance.put(`/bookings/${id}/accept`);
      set({
        bookings: get().bookings.map((b) => (b._id === id ? res.data : b)),
        pendingCount: Math.max(0, get().pendingCount - 1),
      });
      toast.success("Booking accepted!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept booking");
    }
  },

  declineBooking: async (id) => {
    try {
      const res = await axiosInstance.put(`/bookings/${id}/decline`);
      set({
        bookings: get().bookings.map((b) => (b._id === id ? res.data : b)),
        pendingCount: Math.max(0, get().pendingCount - 1),
      });
      toast.success("Booking declined");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to decline booking");
    }
  },

  cancelBooking: async (id) => {
    try {
      const res = await axiosInstance.put(`/bookings/${id}/cancel`);
      set({
        bookings: get().bookings.map((b) => (b._id === id ? res.data : b)),
      });
      toast.success("Booking cancelled");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  },

  linkPost: async (bookingId, postId) => {
    try {
      await axiosInstance.put(`/bookings/${bookingId}/link-post`, { postId });
    } catch (error) {
      console.error("Failed to link post to booking");
    }
  },
}));
