import { MessageCircle } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const ChatButton = () => {
  const { togglePopup, isPopupOpen, totalUnread } = useChatStore();

  return (
    <button
      onClick={togglePopup}
      aria-label="Open messages"
      className={`
        fixed bottom-5 right-5 z-50
        size-14 rounded-full shadow-lg
        btn btn-primary
        flex items-center justify-center
        transition-transform duration-200
        ${isPopupOpen ? "scale-90" : "hover:scale-105"}
      `}
    >
      <MessageCircle className="size-6" />
      {totalUnread > 0 && (
        <span className="absolute -top-1 -right-1 size-5 rounded-full bg-error text-error-content text-xs font-bold flex items-center justify-center">
          {totalUnread > 9 ? "9+" : totalUnread}
        </span>
      )}
    </button>
  );
};

export default ChatButton;
