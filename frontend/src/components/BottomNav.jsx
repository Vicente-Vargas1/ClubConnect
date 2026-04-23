import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Map, MessageCircle, User } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const tabs = [
  { to: "/", icon: LayoutGrid, label: "Feed" },
  { to: "/explore", icon: Map, label: "Explore" },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const { pathname } = useLocation();
  const { totalUnread: chatUnread } = useChatStore();

  const isActive = (to) => {
    if (to === "/") return pathname === "/";
    return pathname.startsWith(to);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-100/95 backdrop-blur border-t border-base-300">
      <div className="flex">
        {tabs.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors relative ${
              isActive(to)
                ? "text-primary"
                : "text-base-content/50 hover:text-base-content/80"
            }`}
          >
            <div className="relative">
              <Icon className="size-5" />
              {to === "/chat" && chatUnread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[1.1rem] h-[1.1rem] rounded-full bg-error text-error-content text-[10px] font-bold flex items-center justify-center px-0.5">
                  {chatUnread > 9 ? "9+" : chatUnread}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
