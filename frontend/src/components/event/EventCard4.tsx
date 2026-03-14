import { EVENT_FORMATS, TICKET_TYPES, type IEventState } from "@/types/event.types";
import { CalendarDays, MapPin, Users, Wifi, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function EventCard({ event }: { event: IEventState }) {
  if (!event) return null;

  const navigate = useNavigate();
  const isFree = event.ticketType === TICKET_TYPES.FREE;
  const isOnline = event.format === EVENT_FORMATS.ONLINE;

  const now = new Date();
  const start = new Date(event.startDateTime);
  const end = new Date(event.endDateTime);

  const isLive = now >= start && now <= end;
  const isEnded = now > end || event.eventStatus === "completed";
  const isCancelled = event.eventStatus === "cancelled";
  const isSuspended = event.eventStatus === "suspended";

  const dateObj = new Date(event.startDateTime);
  const day = dateObj.toLocaleDateString("en-IN", { day: "2-digit" });
  const month = dateObj.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
  const weekday = dateObj.toLocaleDateString("en-IN", { weekday: "short" });
  const time = dateObj.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const capacityPercent = event.capacity
    ? Math.min(((event.soldTickets ?? 0) / event.capacity) * 100, 100)
    : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onClick={() => navigate(`/events/${event.eventId}`)}
      className={`
        group relative cursor-pointer rounded-2xl overflow-hidden
        bg-[var(--card-bg)] border border-[var(--card-border)]
        shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)]
        transition-all duration-400 flex flex-row h-72
        ${isEnded || isCancelled || isSuspended ? "opacity-75 grayscale-[30%]" : ""}
      `}
    >
      {/* LEFT: Date ribbon + image */}
      <div className="relative w-28 shrink-0 flex flex-col items-center pt-5 bg-[var(--bg-secondary)] border-r border-[var(--card-border)]">
        {/* Date block */}
        <div className="text-center">
          <div className="text-3xl font-bold text-[var(--heading-primary)] leading-none">
            {day}
          </div>
          <div className="text-lg font-semibold text-[var(--brand-primary)]">
            {month}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">{weekday}</div>
        </div>

        {/* Small time below */}
        <div className="mt-3 text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
          <Clock size={13} />
          {time}
        </div>

        {/* Vertical line accent */}
        <div className="absolute bottom-0 left-1/2 w-px h-20 bg-gradient-to-b from-[var(--brand-primary)] to-transparent opacity-40" />
      </div>

      {/* RIGHT: Image + content overlay */}
      <div className="relative flex-1">
        {/* Image */}
        <div className="absolute inset-0">
          {event.posterUrl ? (
            <img
              src={event.posterUrl}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-[var(--bg-tertiary)] flex items-center justify-center">
              <CalendarDays size={48} className="text-[var(--text-tertiary)] opacity-40" />
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative h-full p-6 flex flex-col justify-between z-10">
          {/* Top row: badges */}
          <div className="flex items-start justify-between gap-3">
            {/* Price / Free */}
            <span
              className={`
                px-3.5 py-1.5 text-sm font-semibold rounded-full
                backdrop-blur-sm border
                ${isFree
                  ? "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border-[var(--badge-success-border)]"
                  : "bg-[var(--badge-primary-bg)] text-[var(--badge-primary-text)] border-[var(--badge-primary-border)]"
                }
              `}
            >
              {isFree ? "FREE" : `₹${(event.ticketPrice ?? 0).toLocaleString("en-IN")}`}
            </span>

            {/* Status pill */}
            <div className="flex items-center gap-2">
              {isLive && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-success)] opacity-70" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--status-success)]" />
                </span>
              )}

              <span
                className={`
                  px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full
                  backdrop-blur-sm border
                  ${isCancelled
                    ? "bg-[var(--badge-error-bg)] text-[var(--badge-error-text)] border-[var(--badge-error-border)]"
                    : isSuspended
                    ? "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)] border-[var(--badge-warning-border)]"
                    : isEnded
                    ? "bg-[var(--badge-secondary-bg)] text-[var(--badge-secondary-text)] border-[var(--badge-secondary-border)]"
                    : isLive
                    ? "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border-[var(--badge-success-border)]"
                    : "bg-[var(--badge-info-bg)] text-[var(--badge-info-text)] border-[var(--badge-info-border)]"
                  }
                `}
              >
                {isCancelled
                  ? "CANCELLED"
                  : isSuspended
                  ? "SUSPENDED"
                  : isEnded
                  ? "ENDED"
                  : isLive
                  ? "LIVE"
                  : "UPCOMING"}
              </span>
            </div>
          </div>

          {/* Main content */}
          <div className="mt-auto space-y-3">
            {/* Format tag */}
            <div
              className={`
                inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full
                backdrop-blur-sm border
                ${isOnline
                  ? "bg-[var(--badge-info-bg)] text-[var(--badge-info-text)] border-[var(--badge-info-border)]"
                  : "bg-[var(--badge-secondary-bg)] text-[var(--badge-secondary-text)] border-[var(--badge-secondary-border)]"
                }
              `}
            >
              {isOnline ? <Wifi size={14} /> : <MapPin size={14} />}
              {isOnline ? "Online" : "In-person"}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-[var(--heading-primary)] leading-tight line-clamp-2 group-hover:text-[var(--brand-primary)] transition-colors duration-300">
              {event.title}
            </h3>

            {/* Quick info */}
            <div className="flex items-center gap-5 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
                <Users size={15} />
                <span>{event.soldTickets ?? 0} going</span>
              </div>
              {!isOnline && event.locationName && (
                <div className="truncate max-w-[180px]">
                  {event.locationName}
                </div>
              )}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-[var(--text-tertiary)] truncate max-w-[60%]">
              {event.organizer?.organizerName || "—"}
            </span>

            <motion.span
              className="inline-flex items-center gap-1.5 font-medium text-[var(--brand-primary)] group-hover:text-[var(--brand-primary-hover)] transition-colors"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              Details
              <ArrowRight size={16} />
            </motion.span>
          </div>
        </div>
      </div>

      {/* Capacity bar – thin line at bottom */}
      {event.capacity && capacityPercent > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--bg-tertiary)] overflow-hidden">
          <motion.div
            className="h-full bg-[var(--brand-primary)]"
            initial={{ width: 0 }}
            animate={{ width: `${capacityPercent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
      )}
    </motion.article>
  );
}

export default EventCard;