import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader, Mic, Send, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import vinylImage from "../assets/vinyl.png";
import toast from "react-hot-toast";

const ChatPopup = () => {
  const {
    isPopupOpen,
    closePopup,
    users,
    getUsers,
    isUsersLoading,
    popupSelectedUser,
    setPopupSelectedUser,
    popupMessages,
    isPopupMessagesLoading,
    sendPopupMessage,
    unreadCounts,
    typingUsers,
    sendTyping,
    stopTyping,
  } = useChatStore();
  const { clearPendingPopupMessage } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);
  const audioInputRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    if (isPopupOpen && users.length === 0) getUsers();
  }, [isPopupOpen, users.length, getUsers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [popupMessages, typingUsers]);

  useEffect(() => {
    const pending = useChatStore.getState().pendingPopupMessage;
    if (popupSelectedUser && pending) {
      setMessageText(pending);
      clearPendingPopupMessage();
    }
  }, [popupSelectedUser, clearPendingPopupMessage]);

  const handleTextChange = (e) => {
    setMessageText(e.target.value);
    if (!popupSelectedUser) return;
    const toId = popupSelectedUser._id;
    sendTyping(toId);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => stopTyping(toId), 1500);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    if (popupSelectedUser) {
      stopTyping(popupSelectedUser._id);
      clearTimeout(typingTimerRef.current);
    }
    await sendPopupMessage({ text: messageText.trim() });
    setMessageText("");
  };

  const handleAudioSend = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Audio file must be under 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendPopupMessage({ audio: reader.result });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const isTyping = popupSelectedUser && typingUsers[popupSelectedUser._id];

  return (
    <div
      className={`
        fixed bottom-24 right-5 z-50
        w-80 rounded-2xl shadow-2xl border border-base-300
        bg-base-100 flex flex-col overflow-hidden
        transition-all duration-300 ease-out
        ${isPopupOpen
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"}
      `}
      style={{ height: 440 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-base-200 border-b border-base-300 flex-shrink-0">
        {popupSelectedUser ? (
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() =>
                useChatStore.setState({ popupSelectedUser: null, popupMessages: [] })
              }
              className="btn btn-ghost btn-xs btn-circle flex-shrink-0"
            >
              <ArrowLeft className="size-4" />
            </button>
            <img
              src={popupSelectedUser.profilePic || vinylImage}
              alt=""
              className="size-7 rounded-full object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <span className="font-semibold text-sm truncate block">
                {popupSelectedUser.fullName}
              </span>
              {isTyping ? (
                <span className="text-[10px] text-primary">typing…</span>
              ) : onlineUsers.includes(popupSelectedUser._id) ? (
                <span className="text-[10px] text-success">Online</span>
              ) : null}
            </div>
          </div>
        ) : (
          <span className="font-semibold text-sm">Messages</span>
        )}
        <button onClick={closePopup} className="btn btn-ghost btn-xs btn-circle flex-shrink-0">
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {!popupSelectedUser ? (
          isUsersLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="size-5 animate-spin text-primary" />
            </div>
          ) : (
            <ul>
              {users.map((user) => (
                <li key={user._id}>
                  <button
                    onClick={() => setPopupSelectedUser(user)}
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
                      <p className="text-xs text-base-content/50">
                        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                      </p>
                    </div>
                    {unreadCounts[user._id] > 0 && (
                      <span className="size-5 rounded-full bg-error text-error-content text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {unreadCounts[user._id] > 9 ? "9+" : unreadCounts[user._id]}
                      </span>
                    )}
                  </button>
                </li>
              ))}
              {users.length === 0 && (
                <p className="text-center text-base-content/50 py-8 text-sm">No users yet</p>
              )}
            </ul>
          )
        ) : (
          <div className="flex flex-col gap-1 p-3 h-full overflow-y-auto">
            {isPopupMessagesLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader className="size-5 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {popupMessages.map((msg, i) => {
                  const isMine = msg.senderId === authUser?._id;
                  return (
                    <div
                      key={msg._id || i}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex flex-col gap-0.5 max-w-[75%]">
                        <div
                          className={`w-fit rounded-xl px-3 py-2 text-sm break-words ${
                            isMine
                              ? "bg-primary text-primary-content rounded-br-none ml-auto"
                              : "bg-base-200 rounded-bl-none"
                          }`}
                        >
                          {msg.image && (
                            <img
                              src={msg.image}
                              alt=""
                              className="rounded-lg mb-1 max-w-full"
                            />
                          )}
                          {msg.audio && (
                            <audio controls src={msg.audio} className="w-40 h-8" />
                          )}
                          {msg.text}
                        </div>
                        <div className={`flex items-center gap-1 ${isMine ? "justify-end" : "justify-start"}`}>
                          {msg.createdAt && (
                            <span className="text-[10px] text-base-content/40">
                              {formatMessageTime(msg.createdAt)}
                            </span>
                          )}
                          {isMine && (
                            <span className={`text-[10px] ${msg.read ? "text-primary" : "text-base-content/30"}`}>
                              {msg.read ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-base-200 rounded-xl rounded-bl-none px-3 py-2 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-base-content/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="size-1.5 rounded-full bg-base-content/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="size-1.5 rounded-full bg-base-content/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input — only in chat view */}
      {popupSelectedUser && (
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 px-3 py-2 border-t border-base-300 flex-shrink-0"
        >
          <button
            type="button"
            onClick={() => audioInputRef.current?.click()}
            className="btn btn-ghost btn-xs btn-circle flex-shrink-0"
            title="Send audio clip"
          >
            <Mic className="size-4" />
          </button>
          <input
            type="file"
            accept="audio/*"
            ref={audioInputRef}
            onChange={handleAudioSend}
            className="hidden"
          />
          <input
            value={messageText}
            onChange={handleTextChange}
            placeholder="Message…"
            className="input input-sm input-bordered flex-1"
          />
          <button type="submit" className="btn btn-sm btn-primary btn-circle">
            <Send className="size-4" />
          </button>
        </form>
      )}
    </div>
  );
};

export default ChatPopup;
