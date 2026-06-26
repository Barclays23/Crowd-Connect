import { type IEventState } from "@/types/event.types";
import { CalendarDays, MapPin, Users, Wifi, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EVENT_FORMATS, TICKET_TYPES } from "@/constants/event.constants";

const accentColors = {
  music: "from-purple-600 to-pink-600",
  tech: "from-blue-600 to-cyan-600",
  sports: "from-orange-600 to-red-600",
  art: "from-amber-600 to-yellow-600",
  // fallback
  default: "from-indigo-600 to-violet-600",
};

function getAccentColor(event: IEventState) {
  const cat = (event.category || "").toLowerCase();
  if (cat.includes("music")) return accentColors.music;
  if (cat.includes("tech") || cat.includes("conference")) return accentColors.tech;
  if (cat.includes("sport")) return accentColors.sports;
  if (cat.includes("art") || cat.includes("exhibit")) return accentColors.art;
  return accentColors.default;
}

function formatEventDate(start: string) {
  const date = new Date(start);
  return {
    day: date.toLocaleDateString("en-IN", { day: "2-digit" }),
    month: date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
    weekday: date.toLocaleDateString("en-IN", { weekday: "short" }),
    time: date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }),
  };
}

function EventCard({ event }: { event: IEventState }) {
  if (!event) return null;

  const navigate = useNavigate();
  const isFree = event.ticketType === TICKET_TYPES.FREE;
  const isOnline = event.format === EVENT_FORMATS.ONLINE;
  const isEnded = new Date() > new Date(event.endDateTime) || event.eventStatus === "completed" || ["cancelled", "suspended"].includes(event.eventStatus || "");

  const accent = getAccentColor(event);
  const dateInfo = formatEventDate(event.startDateTime);

  const capacityPercent = event.capacity ? Math.min(((event.soldTickets || 0) / event.capacity) * 100, 100) : 0;
  const seatsLeft = event.capacity ? event.capacity - (event.soldTickets || 0) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10, transition: { duration: 0.4 } }}
      onClick={() => navigate(`/events/${event.eventId}`)}
      className={`
        group relative cursor-pointer rounded-2xl overflow-hidden
        bg-gray-950 border border-gray-800/60 shadow-xl
        transition-all duration-500 h-full flex flex-col
        ${isEnded ? "grayscale opacity-70" : ""}
      `}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b ${accent} z-20`} />

      <div className="relative flex-1 flex flex-col">
        {/* Hero Image + angled overlay */}
        <div className="relative h-64 shrink-0 overflow-hidden">
          {event.posterUrl ? (
            <motion.img
              src={event.posterUrl}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover brightness-90 transition-transform duration-700 group-hover:scale-110"
              whileHover={{ scale: 1.12 }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
              <CalendarDays className="w-20 h-20 text-gray-700/50" />
            </div>
          )}

          {/* Diagonal overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-transparent" />

          {/* Date block - prominent top-right */}
          <div className="absolute top-5 right-5 z-10">
            <div className="bg-gray-950/80 backdrop-blur-md border border-gray-700/60 rounded-xl px-4 py-3 text-center shadow-lg">
              <div className="text-3xl font-bold text-white leading-none">{dateInfo.day}</div>
              <div className="text-lg font-semibold text-indigo-300">{dateInfo.month}</div>
              <div className="text-xs text-gray-400 mt-1">{dateInfo.weekday}</div>
              <div className="text-sm text-gray-300 mt-2 border-t border-gray-700/50 pt-2">
                {dateInfo.time}
              </div>
            </div>
          </div>

          {/* Format + Price pill bottom-left over image */}
          <div className="absolute bottom-5 left-5 z-10 flex gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-gray-700/50 text-sm font-medium text-white">
              {isOnline ? <Wifi size={15} className="text-cyan-400" /> : <MapPin size={15} className="text-violet-400" />}
              {isOnline ? "Online" : "In-person"}
            </div>

            <div className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md border border-opacity-40
              ${isFree 
                ? "bg-emerald-900/60 border-emerald-500/40 text-emerald-300" 
                : "bg-indigo-900/60 border-indigo-500/40 text-indigo-200"
              }`}>
              {isFree ? "FREE" : `₹${(event.ticketPrice || 0).toLocaleString("en-IN")}`}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Category & Status */}
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${accent}`} />
              {event.category || "Event"}
            </span>

            {event.eventStatus === "cancelled" && (
              <span className="text-xs font-bold px-3 py-1 bg-red-950/60 text-red-300 rounded-full border border-red-800/40">
                Cancelled
              </span>
            )}
            {event.eventStatus === "suspended" && (
              <span className="text-xs font-bold px-3 py-1 bg-amber-950/60 text-amber-300 rounded-full border border-amber-800/40">
                Suspended
              </span>
            )}
            {isEnded && event.eventStatus !== "cancelled" && event.eventStatus !== "suspended" && (
              <span className="text-xs font-bold px-3 py-1 bg-gray-800 text-gray-400 rounded-full border border-gray-700">
                Ended
              </span>
            )}
            {!isEnded && new Date() >= new Date(event.startDateTime) && (
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-950/60 text-emerald-300 rounded-full border border-emerald-800/40">
                  LIVE
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white leading-tight line-clamp-2 mb-3 group-hover:text-indigo-300 transition-colors duration-300">
            {event.title}
          </h3>

          {/* Location & attendees */}
          <div className="space-y-2.5 text-gray-300 text-sm mb-5">
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-indigo-400 shrink-0" />
              <span className="truncate">
                {isOnline ? "Virtual Event" : event.locationName || "Venue TBA"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Users size={16} className="text-indigo-400 shrink-0" />
              <span>{event.soldTickets || 0} attending</span>
            </div>
          </div>

          {/* Progress bar */}
          {event.capacity && (
            <div className="mt-auto">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>
                  {seatsLeft === 0 ? "Sold Out" : seatsLeft! <= 10 ? `${seatsLeft} seats left!` : "Seats available"}
                </span>
                <span>{Math.round(capacityPercent)}% filled</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${accent}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${capacityPercent}%` }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t border-gray-800/50 bg-gradient-to-r from-gray-950 to-gray-900/80 flex items-center justify-between">
          <div className="text-sm text-gray-400 truncate max-w-[60%]">
            {event.organizer?.organizerName || "Hosted by"}
          </div>

          <motion.div
            className="flex items-center gap-2 text-indigo-300 font-medium group-hover:text-indigo-200 transition-colors"
            whileHover={{ x: 6 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            View Details
            <ArrowRight size={18} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default EventCard;