import { Link } from "react-router-dom";
import { Music, MapPin, MessageCircle, Calendar, Users, Zap } from "lucide-react";
import djController from "../assets/dj-controller.png";

const features = [
  {
    icon: <Calendar className="size-6 text-primary" />,
    title: "Easy Bookings",
    desc: "Venues post DJ listings. DJs express interest. Bookings happen in minutes.",
  },
  {
    icon: <Users className="size-6 text-secondary" />,
    title: "Social Feed",
    desc: "Follow DJs and venues, share posts, and stay connected with your scene.",
  },
  {
    icon: <MapPin className="size-6 text-accent" />,
    title: "Explore Your City",
    desc: "Discover DJs and venues on an interactive map near you.",
  },
  {
    icon: <MessageCircle className="size-6 text-primary" />,
    title: "Direct Messaging",
    desc: "Chat directly with DJs or venues to discuss details and negotiate.",
  },
  {
    icon: <Music className="size-6 text-secondary" />,
    title: "DJ Profiles",
    desc: "Showcase genres, links, and past bookings to stand out from the crowd.",
  },
  {
    icon: <Zap className="size-6 text-accent" />,
    title: "Real-Time Alerts",
    desc: "Get notified the moment a booking request lands or a DJ says they're in.",
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-base-100">

      {/* NAV */}
      <header className="fixed top-0 w-full z-40 bg-base-100/80 backdrop-blur border-b border-base-300">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Music className="size-4 text-primary" />
            </div>
            <span className="font-bold text-lg">ClubConnect</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Sign up free</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
              <Zap className="size-3.5" />
              The DJ booking platform
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
              Book DJs.<br />
              Fill venues.<br />
              <span className="text-primary">Build your scene.</span>
            </h1>
            <p className="text-base-content/60 text-lg max-w-md mx-auto lg:mx-0">
              ClubConnect connects DJs and venues in one place — book talent, discover events, and grow your network.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Get started — it's free
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg">
                I already have an account
              </Link>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-75" />
              <img
                src={djController}
                alt="DJ Controller"
                className="relative w-72 lg:w-96 drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <section className="bg-base-200 py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-x-12 gap-y-3 text-sm text-base-content/60 font-medium">
          <span>DJs & Venues</span>
          <span>·</span>
          <span>Real-time notifications</span>
          <span>·</span>
          <span>Direct messaging</span>
          <span>·</span>
          <span>Map-based discovery</span>
          <span>·</span>
          <span>Booking management</span>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Everything you need in one place</h2>
            <p className="text-base-content/60 max-w-lg mx-auto">
              Whether you're a DJ looking for gigs or a venue searching for talent, ClubConnect has you covered.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-base-200 rounded-xl p-5 space-y-3">
                <div className="size-12 rounded-lg bg-base-100 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-base-content/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 bg-base-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create your profile", desc: "Sign up as a DJ or venue and set up your profile in minutes." },
              { step: "2", title: "Connect", desc: "Venues post DJ listings. DJs browse and express interest." },
              { step: "3", title: "Book & perform", desc: "Accept a booking request and get to the decks." },
            ].map((s) => (
              <div key={s.step} className="space-y-3">
                <div className="size-12 rounded-full bg-primary text-primary-content font-bold text-lg flex items-center justify-center mx-auto">
                  {s.step}
                </div>
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-base-content/60 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to connect?</h2>
          <p className="text-base-content/60">
            Join DJs and venues already using ClubConnect to book shows and fill floors.
          </p>
          <Link to="/signup" className="btn btn-primary btn-lg w-full sm:w-auto">
            Create your free account
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-base-300 py-6 px-6 text-center text-sm text-base-content/40">
        © {new Date().getFullYear()} ClubConnect · Connect DJs and venues
      </footer>

    </div>
  );
};

export default LandingPage;
