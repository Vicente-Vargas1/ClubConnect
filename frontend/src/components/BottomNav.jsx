import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Map, MessageCircle, User } from "lucide-react";

const tabs = [
  { to: "/", icon: LayoutGrid, label: "Feed" },
  { to: "/explore", icon: Map, label: "Explore" },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const { pathname } = useLocation();

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
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              isActive(to)
                ? "text-primary"
                : "text-base-content/50 hover:text-base-content/80"
            }`}
          >
            <Icon className="size-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
