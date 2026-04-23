import { useState, useEffect, useRef } from "react";
import { Bell, Calendar, CheckCheck, Music, X } from "lucide-react";
import { useNotificationStore } from "../store/useNotificationStore";
import { useNavigate } from "react-router-dom";
import vinylImage from "../assets/vinyl.png";

const typeIcon = {
  booking_request: <Calendar className="size-4 text-warning" />,
  booking_accepted: <Calendar className="size-4 text-success" />,
  dj_interested: <Music className="size-4 text-secondary" />,
};

const timeAgo = (date) => {
  const secs = Math.floor((Date.now() - new Date(date)) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
};

const NotificationBell = () => {
  const { notifications, unreadCount, fetchNotifications, markAllRead, isLoading } =
    useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (!isOpen) fetchNotifications();
    setIsOpen((v) => !v);
  };

  const handleNotificationClick = (n) => {
    setIsOpen(false);
    if (n.type === "booking_request" || n.type === "booking_accepted") {
      navigate("/profile");
    } else if (n.type === "dj_interested" && n.postId) {
      navigate("/");
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="btn btn-sm btn-ghost relative"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 size-5 rounded-full bg-error text-error-content text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-base-100 border border-base-300 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-200">
            <h4 className="font-semibold text-sm">Notifications</h4>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="btn btn-ghost btn-xs gap-1 text-xs"
                  title="Mark all as read"
                >
                  <CheckCheck className="size-3.5" />
                  Mark read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-xs btn-circle">
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-sm text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-center text-base-content/50 text-sm py-10">
                No notifications yet.
              </p>
            ) : (
              <ul className="divide-y divide-base-200">
                {notifications.map((n) => (
                  <li
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-base-200 transition-colors ${
                      !n.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <img
                      src={n.senderId?.profilePic || vinylImage}
                      className="size-9 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-1.5">
                        {typeIcon[n.type]}
                        <p className="text-xs text-base-content/80 leading-snug flex-1">
                          {n.message}
                        </p>
                        {!n.read && (
                          <span className="size-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[10px] text-base-content/40 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
