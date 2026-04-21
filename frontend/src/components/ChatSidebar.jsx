import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import vinylImage from "../assets/vinyl.png";

const ChatSidebar = () => {
  const { recentContacts, getRecentContacts, setPopupSelectedUser, unreadCounts, isPopupOpen, togglePopup } =
    useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getRecentContacts();
  }, [getRecentContacts]);

  const handleUserClick = (user) => {
    if (!isPopupOpen) togglePopup();
    setPopupSelectedUser(user);
  };

  return (
    <div className="bg-base-100 rounded-xl border border-base-300 shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-base-300">
        <h3 className="font-semibold text-sm">Messages</h3>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-180px)]">
        {recentContacts.length === 0 ? (
          <p className="text-center text-base-content/50 text-xs py-8 px-4">No contacts yet.</p>
        ) : (
          <ul>
            {recentContacts.map((user) => (
              <li key={user._id}>
                <button
                  onClick={() => handleUserClick(user)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-base-200 transition-colors text-left"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.profilePic || vinylImage}
                      alt=""
                      className="size-9 rounded-full object-cover"
                    />
                    {onlineUsers.includes(user._id) && (
                      <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-green-500 ring-1 ring-base-100" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.fullName}</p>
                    {user.lastMessage ? (
                      <p className="text-xs text-base-content/50 truncate">{user.lastMessage.text}</p>
                    ) : (
                      <p className="text-xs text-base-content/40">
                        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                      </p>
                    )}
                  </div>
                  {unreadCounts[user._id] > 0 && (
                    <span className="size-5 rounded-full bg-error text-error-content text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {unreadCounts[user._id] > 9 ? "9+" : unreadCounts[user._id]}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
