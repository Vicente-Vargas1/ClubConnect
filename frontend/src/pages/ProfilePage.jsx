import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useSocialStore } from "../store/useSocialStore";
import { useFollowStore } from "../store/useFollowStore";
import { useBookingStore } from "../store/useBookingStore";
import { useReviewStore } from "../store/useReviewStore";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { Camera, Mail, User, Star, Calendar, Clock, MapPin, DollarSign, X } from "lucide-react";
import { formatTimeTo12Hr } from "../lib/utils";
import vinylImage from "../assets/vinyl.png";
import PostCard from "../components/PostCard";
import toast from "react-hot-toast";

const StarRating = ({ value, onChange, readonly = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className="text-yellow-400 disabled:cursor-default"
        >
          <Star
            className="size-5"
            fill={(hovered || value) >= star ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
};

const ProfilePage = () => {
  const { id } = useParams();
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();

  const [selectedImg, setSelectedImg] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");

  const isOwnProfile = !id;
  const user = isOwnProfile ? authUser : viewUser;

  // Follow store
  const { toggleFollow, isLoading: followLoading, fetchFollowers, fetchFollowing, followersList, followingList } = useFollowStore();
  const [followModal, setFollowModal] = useState(null); // null | "followers" | "following"

  // Review store
  const { reviews, averageRating, totalReviews, fetchReviews, submitReview, deleteReview } =
    useReviewStore();
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  // Booking store
  const { bookings, fetchMyBookings, acceptBooking, declineBooking, cancelBooking, createBooking, fetchPendingCount } =
    useBookingStore();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ date: "", time: "", venueName: "", pay: "" });
  const [bookingLoading, setBookingLoading] = useState(false);

  // Post-acceptance prompt state
  const [acceptedBooking, setAcceptedBooking] = useState(null);
  const [showPostPrompt, setShowPostPrompt] = useState(false);
  const [postPromptText, setPostPromptText] = useState("");

  // Social store for liked posts
  const [likedPosts, setLikedPosts] = useState([]);
  const [likedLoading, setLikedLoading] = useState(false);

  const isFollowing = authUser?.following?.some(
    (fId) => fId === id || fId?._id === id || fId?.toString() === id
  );

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/auth/user/${id}`);
        setViewUser(res.data);
      } catch (err) {
        console.log("Error loading profile:", err);
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (user?._id) {
      fetchReviews(user._id);
    }
  }, [user?._id, fetchReviews]);

  useEffect(() => {
    if (isOwnProfile) {
      fetchMyBookings();
    }
  }, [isOwnProfile, fetchMyBookings]);

  // Pre-fill review form if user already reviewed this person
  useEffect(() => {
    if (!isOwnProfile && authUser) {
      const existing = reviews.find(
        (r) => r.reviewerId?._id === authUser._id || r.reviewerId === authUser._id
      );
      if (existing) {
        setReviewRating(existing.rating);
        setReviewText(existing.text || "");
      } else {
        setReviewRating(0);
        setReviewText("");
      }
    }
  }, [reviews, isOwnProfile, authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleFollow = async () => {
    if (!id) return;
    await toggleFollow(id);
  };

  const handleLikedPostsTab = async () => {
    setActiveTab("liked");
    if (likedPosts.length === 0) {
      setLikedLoading(true);
      try {
        const res = await axiosInstance.get("/posts/liked");
        setLikedPosts(res.data);
      } catch (err) {
        toast.error("Failed to load liked posts");
      } finally {
        setLikedLoading(false);
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewRating) return toast.error("Please select a rating");
    await submitReview(user._id, { rating: reviewRating, text: reviewText });
  };

  const handleDeleteReview = async () => {
    await deleteReview(user._id);
    setReviewRating(0);
    setReviewText("");
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.date || !bookingForm.time || !bookingForm.venueName || !bookingForm.pay) {
      return toast.error("All fields are required");
    }
    setBookingLoading(true);
    await createBooking({ receiverId: id, ...bookingForm });
    setBookingLoading(false);
    setShowBookingModal(false);
    setBookingForm({ date: "", time: "", venueName: "", pay: "" });
  };

  const handleAccept = async (bookingId, booking) => {
    const accepted = await acceptBooking(bookingId);
    if (accepted) {
      const otherParty = accepted.senderId;
      const djName = accepted.senderId?.role === "dj" ? accepted.senderId?.fullName : accepted.receiverId?.fullName;
      setAcceptedBooking(accepted);
      setPostPromptText(
        `🎧 ${djName} is booked at ${accepted.venueName} on ${new Date(accepted.date).toLocaleDateString()} at ${accepted.time}!`
      );
      setShowPostPrompt(true);
    }
  };

  const handlePostFromBooking = async () => {
    if (!postPromptText.trim() || !acceptedBooking) return;
    try {
      const newPost = await useSocialStore.getState().createPost({ text: postPromptText });
      if (newPost?._id) {
        await useBookingStore.getState().linkPost(acceptedBooking._id, newPost._id);
      }
    } catch (err) {
      console.error(err);
    }
    setShowPostPrompt(false);
    setAcceptedBooking(null);
  };

  const pendingReceived = bookings.filter(
    (b) => b.status === "pending" && b.receiverId?._id === authUser?._id
  );
  const pendingSent = bookings.filter(
    (b) => b.status === "pending" && b.senderId?._id === authUser?._id
  );
  const accepted = bookings.filter((b) => b.status === "accepted");
  const closed = bookings.filter((b) => b.status === "declined" || b.status === "cancelled");

  const existingReview = reviews.find(
    (r) => r.reviewerId?._id === authUser?._id || r.reviewerId === authUser?._id
  );

  if (!user) return null;

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">

          {/* HEADER */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <span className="inline-block mt-3 px-3 py-1 rounded-full bg-purple-600 text-white text-sm">
              {user.role === "dj" ? "DJ Account" : "Venue Account"}
            </span>
          </div>

          {/* AVATAR */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || user.profilePic || vinylImage}
                className="size-32 rounded-full object-cover"
              />
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 bg-base-content p-2 rounded-full cursor-pointer">
                  <Camera className="w-5 h-5 text-base-200" />
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>

            {/* Follower / Following counts */}
            <div className="flex gap-6 text-center">
              <button
                className="hover:opacity-70 transition-opacity"
                onClick={() => {
                  fetchFollowers(user._id);
                  setFollowModal("followers");
                }}
              >
                <p className="font-bold text-lg">{user.followers?.length ?? 0}</p>
                <p className="text-xs text-base-content/60">Followers</p>
              </button>
              <button
                className="hover:opacity-70 transition-opacity"
                onClick={() => {
                  fetchFollowing(user._id);
                  setFollowModal("following");
                }}
              >
                <p className="font-bold text-lg">{user.following?.length ?? 0}</p>
                <p className="text-xs text-base-content/60">Following</p>
              </button>
            </div>

            {/* Average Rating */}
            {totalReviews > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(averageRating)} readonly />
                <span className="text-sm text-base-content/70">
                  {averageRating.toFixed(1)} ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
                </span>
              </div>
            )}

            {/* Follow / Book buttons on other user's profile */}
            {!isOwnProfile && (
              <div className="flex gap-3">
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`btn btn-sm ${isFollowing ? "btn-ghost border" : "btn-primary"}`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="btn btn-sm btn-secondary"
                >
                  Book
                </button>
              </div>
            )}
          </div>

          {/* BASIC INFO */}
          <div className="space-y-4">
            <div>
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2 bg-base-200 rounded-lg border">{user.fullName}</p>
            </div>
            <div>
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </div>
              <p className="px-4 py-2 bg-base-200 rounded-lg border">{user.email}</p>
            </div>
          </div>

          {/* DJ PROFILE */}
          {user.role === "dj" && user.profile?.dj && (
            <div className="bg-base-200 p-4 rounded-lg space-y-2">
              <h2 className="font-semibold">DJ Profile</h2>
              <p>Location: {user.profile.dj.location}</p>
              <p>Genres: {user.profile.dj.genres?.join(", ")}</p>
              <p>Instagram: {user.profile.dj.instagram}</p>
              <p>SoundCloud: {user.profile.dj.soundcloud}</p>
            </div>
          )}

          {/* VENUE PROFILE */}
          {user.role === "venue" && user.profile?.venue && (
            <div className="bg-base-200 p-4 rounded-lg space-y-2">
              <h2 className="font-semibold">Venue Profile</h2>
              <p>Location: {user.profile.venue.location}</p>
              <p>Capacity: {user.profile.venue.capacity}</p>
              <p>Type: {user.profile.venue.venueType}</p>
            </div>
          )}

          {/* TABS */}
          <div className="tabs tabs-boxed bg-base-200">
            <button
              className={`tab ${activeTab === "posts" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </button>
            {isOwnProfile && (
              <button
                className={`tab ${activeTab === "liked" ? "tab-active" : ""}`}
                onClick={handleLikedPostsTab}
              >
                Liked Posts
              </button>
            )}
            <button
              className={`tab ${activeTab === "reviews" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews
            </button>
            {isOwnProfile && (
              <button
                className={`tab ${activeTab === "bookings" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("bookings")}
              >
                Bookings
              </button>
            )}
          </div>

          {/* POSTS TAB (placeholder — just links) */}
          {activeTab === "posts" && (
            <p className="text-sm text-base-content/60 text-center py-4">
              Posts appear in the social feed.
            </p>
          )}

          {/* LIKED POSTS TAB */}
          {activeTab === "liked" && isOwnProfile && (
            <div className="space-y-4">
              {likedLoading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-md text-primary" />
                </div>
              ) : likedPosts.length === 0 ? (
                <p className="text-center text-base-content/50 py-8 text-sm">
                  No liked posts yet.
                </p>
              ) : (
                likedPosts.map((post) => <PostCard key={post._id} post={post} />)
              )}
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Leave / Edit review form (other user's profile) */}
              {!isOwnProfile && authUser && (
                <form onSubmit={handleReviewSubmit} className="bg-base-200 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold">
                    {existingReview ? "Update Your Review" : "Leave a Review"}
                  </h3>
                  <StarRating value={reviewRating} onChange={setReviewRating} />
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Optional comment…"
                    className="textarea textarea-bordered w-full text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-sm btn-primary">
                      {existingReview ? "Update Review" : "Submit Review"}
                    </button>
                    {existingReview && (
                      <button
                        type="button"
                        onClick={handleDeleteReview}
                        className="btn btn-sm btn-error btn-outline"
                      >
                        Delete Review
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Reviews list */}
              {reviews.length === 0 ? (
                <p className="text-center text-base-content/50 text-sm py-4">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="flex gap-3 bg-base-200 p-3 rounded-lg">
                    <img
                      src={review.reviewerId?.profilePic || vinylImage}
                      className="size-9 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">
                          {review.reviewerId?.fullName}
                        </span>
                        <StarRating value={review.rating} readonly />
                      </div>
                      {review.text && (
                        <p className="text-sm text-base-content/80 mt-1">{review.text}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* BOOKINGS TAB (own profile only) */}
          {activeTab === "bookings" && isOwnProfile && (
            <div className="space-y-6">

              {/* Pending received */}
              {pendingReceived.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-warning">Incoming Requests</h3>
                  <div className="space-y-3">
                    {pendingReceived.map((b) => (
                      <BookingCard
                        key={b._id}
                        booking={b}
                        authUser={authUser}
                        onAccept={() => handleAccept(b._id, b)}
                        onDecline={() => declineBooking(b._id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Pending sent */}
              {pendingSent.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-info">Sent Requests</h3>
                  <div className="space-y-3">
                    {pendingSent.map((b) => (
                      <BookingCard key={b._id} booking={b} authUser={authUser} />
                    ))}
                  </div>
                </div>
              )}

              {/* Accepted */}
              {accepted.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-success">Accepted</h3>
                  <div className="space-y-3">
                    {accepted.map((b) => (
                      <BookingCard
                        key={b._id}
                        booking={b}
                        authUser={authUser}
                        onCancel={() => cancelBooking(b._id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Closed */}
              {closed.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-base-content/50">Closed</h3>
                  <div className="space-y-3">
                    {closed.map((b) => (
                      <BookingCard key={b._id} booking={b} authUser={authUser} />
                    ))}
                  </div>
                </div>
              )}

              {bookings.length === 0 && (
                <p className="text-center text-base-content/50 text-sm py-4">No bookings yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Book {user.fullName}</h3>
              <button onClick={() => setShowBookingModal(false)} className="btn btn-ghost btn-sm btn-circle">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleBookingSubmit} className="space-y-3">
              <div>
                <label className="label label-text text-sm">Date</label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                />
              </div>
              <div>
                <label className="label label-text text-sm">Time</label>
                <input
                  type="time"
                  className="input input-bordered w-full"
                  value={bookingForm.time}
                  onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                />
              </div>
              <div>
                <label className="label label-text text-sm">Venue Name</label>
                <input
                  type="text"
                  placeholder="Venue name"
                  className="input input-bordered w-full"
                  value={bookingForm.venueName}
                  onChange={(e) => setBookingForm({ ...bookingForm, venueName: e.target.value })}
                />
              </div>
              <div>
                <label className="label label-text text-sm">Pay</label>
                <input
                  type="text"
                  placeholder="e.g. $500 or Negotiable"
                  className="input input-bordered w-full"
                  value={bookingForm.pay}
                  onChange={(e) => setBookingForm({ ...bookingForm, pay: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={bookingLoading}
              >
                {bookingLoading ? <span className="loading loading-spinner loading-sm" /> : "Send Request"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOLLOWERS / FOLLOWING MODAL */}
      {followModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setFollowModal(null)}
        >
          <div
            className="bg-base-100 rounded-xl p-5 w-full max-w-sm max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h3 className="font-bold text-lg capitalize">{followModal}</h3>
              <button onClick={() => setFollowModal(null)} className="btn btn-ghost btn-sm btn-circle">
                <X className="size-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-2">
              {followLoading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-md text-primary" />
                </div>
              ) : (followModal === "followers" ? followersList : followingList).length === 0 ? (
                <p className="text-center text-base-content/50 text-sm py-8">No {followModal} yet.</p>
              ) : (
                (followModal === "followers" ? followersList : followingList).map((u) => (
                  <a
                    key={u._id}
                    href={`/profile/${u._id}`}
                    className="flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                    onClick={() => setFollowModal(null)}
                  >
                    <img
                      src={u.profilePic || vinylImage}
                      className="size-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{u.fullName}</p>
                      <p className="text-xs text-base-content/50 capitalize">{u.role}</p>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* POST PROMPT MODAL (after booking accepted) */}
      {showPostPrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-lg">Booking Confirmed!</h3>
            <p className="text-sm text-base-content/70">Would you like to post about this booking?</p>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              value={postPromptText}
              onChange={(e) => setPostPromptText(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={handlePostFromBooking} className="btn btn-primary flex-1">
                Post
              </button>
              <button
                onClick={() => { setShowPostPrompt(false); setAcceptedBooking(null); }}
                className="btn btn-ghost flex-1"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BookingCard = ({ booking, authUser, onAccept, onDecline, onCancel }) => {
  const isReceiver = booking.receiverId?._id === authUser?._id;
  const otherParty = isReceiver ? booking.senderId : booking.receiverId;

  const statusColor = {
    pending: "badge-warning",
    accepted: "badge-success",
    declined: "badge-error",
    cancelled: "badge-ghost",
  }[booking.status] || "badge-ghost";

  return (
    <div className="bg-base-200 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={otherParty?.profilePic || "/vinyl.png"}
            className="size-8 rounded-full object-cover"
          />
          <span className="font-semibold text-sm">{otherParty?.fullName}</span>
        </div>
        <span className={`badge badge-sm ${statusColor}`}>{booking.status}</span>
      </div>
      <div className="text-sm text-base-content/70 space-y-1">
        <div className="flex items-center gap-2">
          <MapPin className="size-3.5" />
          <span>{booking.venueName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="size-3.5" />
          <span>{new Date(booking.date).toLocaleDateString()}</span>
          <Clock className="size-3.5 ml-2" />
          <span>{formatTimeTo12Hr(booking.time)}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="size-3.5" />
          <span>{booking.pay}</span>
        </div>
      </div>
      {booking.status === "pending" && isReceiver && (
        <div className="flex gap-2 pt-1">
          <button onClick={onAccept} className="btn btn-xs btn-success">Accept</button>
          <button onClick={onDecline} className="btn btn-xs btn-error btn-outline">Decline</button>
        </div>
      )}
      {booking.status === "accepted" && (
        <button onClick={onCancel} className="btn btn-xs btn-ghost border mt-1">Cancel</button>
      )}
    </div>
  );
};

export default ProfilePage;
