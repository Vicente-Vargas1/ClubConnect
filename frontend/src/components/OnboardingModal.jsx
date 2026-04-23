import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { LayoutGrid, Map, MessageCircle, Calendar, X, ChevronRight } from "lucide-react";

const STEPS = [
  {
    title: (role) => `Welcome to ClubConnect${role ? `, ${role === "dj" ? "DJ" : "Venue"}!` : "!"}`,
    subtitle: (role) =>
      role === "dj"
        ? "You're set up as a DJ. Here's a quick look at what you can do."
        : "You're set up as a venue. Here's a quick look at what you can do.",
    content: null,
  },
  {
    title: () => "Your key features",
    subtitle: () => "Here's everything you have access to:",
    content: [
      {
        icon: <LayoutGrid className="size-5 text-primary" />,
        heading: "Social Feed",
        body: "Post updates, browse DJ listings, like and comment on posts from your network.",
      },
      {
        icon: <Calendar className="size-5 text-secondary" />,
        heading: "Bookings",
        body: "Send or receive booking requests. Manage everything from your Profile page.",
      },
      {
        icon: <Map className="size-5 text-accent" />,
        heading: "Explore Map",
        body: "Discover DJs and venues near you on an interactive map.",
      },
      {
        icon: <MessageCircle className="size-5 text-primary" />,
        heading: "Direct Messages",
        body: "Chat with anyone. Use the message icon on any profile or from your feed.",
      },
    ],
  },
  {
    title: () => "You're all set!",
    subtitle: () => "Start by completing your profile and exploring the feed.",
    content: null,
  },
];

const OnboardingModal = ({ onClose }) => {
  const { authUser } = useAuthStore();
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-primary/10 px-6 pt-6 pb-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 btn btn-ghost btn-xs btn-circle"
          >
            <X className="size-4" />
          </button>
          <div className="flex gap-1.5 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full flex-1 transition-colors ${
                  i <= step ? "bg-primary" : "bg-base-300"
                }`}
              />
            ))}
          </div>
          <h2 className="text-xl font-bold">{current.title(authUser?.role)}</h2>
          <p className="text-sm text-base-content/60 mt-1">{current.subtitle(authUser?.role)}</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {current.content ? (
            <div className="space-y-3">
              {current.content.map((item) => (
                <div key={item.heading} className="flex gap-3 items-start bg-base-200 rounded-xl p-3">
                  <div className="size-9 rounded-lg bg-base-100 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.heading}</p>
                    <p className="text-xs text-base-content/60 mt-0.5">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-base-content/60 text-sm">
              {step === 0
                ? "Let's take a 30-second tour of the platform."
                : "Head to your profile to add a bio, genres, and social links."}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-between items-center">
          {step > 0 ? (
            <button onClick={() => setStep((s) => s - 1)} className="btn btn-ghost btn-sm">
              Back
            </button>
          ) : (
            <div />
          )}
          <button onClick={handleNext} className="btn btn-primary btn-sm gap-1">
            {isLast ? "Get started" : "Next"}
            {!isLast && <ChevronRight className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
