import { useEffect } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useBookingStore } from "../store/useBookingStore";
import { formatTimeTo12Hr } from "../lib/utils";
import vinylImage from "../assets/vinyl.png";

const UpcomingEvents = () => {
  const { upcomingBookings, fetchUpcomingBookings } = useBookingStore();

  useEffect(() => {
    fetchUpcomingBookings();
  }, [fetchUpcomingBookings]);

  return (
    <div className="bg-base-100 rounded-xl border border-base-300 shadow overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-base-300 flex-shrink-0">
        <h3 className="font-semibold text-sm">Upcoming Events</h3>
      </div>

      <div className="overflow-y-auto flex-1">
        {upcomingBookings.length === 0 ? (
          <p className="text-center text-base-content/50 text-xs py-8 px-4">
            No upcoming events yet.
          </p>
        ) : (
          <ul className="divide-y divide-base-200">
            {upcomingBookings.map((booking) => {
              const dj =
                booking.senderId?.role === "dj"
                  ? booking.senderId
                  : booking.receiverId;

              return (
                <li key={booking._id} className="px-4 py-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={dj?.profilePic || vinylImage}
                      className="size-7 rounded-full object-cover flex-shrink-0"
                    />
                    <span className="text-sm font-medium truncate">{dj?.fullName}</span>
                  </div>
                  <div className="space-y-0.5 pl-1">
                    <div className="flex items-center gap-1.5 text-xs text-base-content/70">
                      <MapPin className="size-3 flex-shrink-0" />
                      <span className="truncate">{booking.venueName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-base-content/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(booking.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {booking.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatTimeTo12Hr(booking.time)}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;
