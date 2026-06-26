import { EVENT_FORMATS, TICKET_TYPES } from "@/constants/event.constants";
import { type IEventState } from "@/types/event.types";
import { Calendar, MapPin, Tag, Users, Wifi, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";


function getStatusBadge(event: IEventState) {
    const now = new Date();
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);

    if (event.eventStatus === "cancelled") return { label: "Cancelled", style: "bg-(--badge-danger-bg) text-(--badge-danger-text) border-(--badge-danger-border)" };
    if (event.eventStatus === "suspended") return { label: "Suspended", style: "bg-(--badge-warning-bg) text-(--badge-warning-text) border-(--badge-warning-border)" };
    if (now > end || event.eventStatus === "completed") return { label: "Ended", style: "bg-(--badge-secondary-bg) text-(--badge-secondary-text) border-(--badge-secondary-border)" };
    if (now >= start && now <= end) return { label: "Live Now", style: "bg-(--badge-success-bg) text-(--badge-success-text) border-(--badge-success-border)", pulse: true };
    return { label: "Upcoming", style: "bg-(--badge-info-bg) text-(--badge-info-text) border-(--badge-info-border)" };
}


function getSeatsInfo(event: IEventState) {
    if (!event.capacity) return null;
    const remaining = event.capacity - (event.soldTickets ?? 0);
    const percentFull = ((event.soldTickets ?? 0) / event.capacity) * 100;
    if (remaining <= 0) return { label: "Sold Out", color: "text-(--status-error)", fillColor: "bg-(--status-error)", percent: 100 };
    if (remaining <= 10) return { label: `${remaining} seats left`, color: "text-(--status-warning)", fillColor: "bg-(--status-warning)", percent: percentFull };
    return { label: `${remaining} of ${event.capacity} seats`, color: "text-(--text-tertiary)", fillColor: "bg-(--brand-primary)", percent: percentFull };
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
        weekday: "short", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function EventCard({ event }: { event: IEventState }) {
    if (!event) return null;

    const navigate = useNavigate();
    const isFree = event.ticketType === TICKET_TYPES.FREE;
    const isOnline = event.format === EVENT_FORMATS.ONLINE;
    const status = getStatusBadge(event);
    const seats = getSeatsInfo(event);
    const isEnded = status.label === "Ended" || status.label === "Cancelled" || status.label === "Suspended";

    return (
        <article
            onClick={() => navigate(`/events/${event.eventId}`)}
            className="group cursor-pointer bg-(--card-bg) border border-(--card-border) rounded-2xl overflow-hidden 
                shadow-(--card-shadow) hover:shadow-(--card-shadow-hover) hover:border-(--brand-primary) transition-all duration-300 flex flex-col h-full"
        >
            {/* Image */}
            <div className="relative h-52 overflow-hidden bg-(--bg-tertiary) shrink-0">
                {event.posterUrl ? (
                    <img
                        src={event.posterUrl}
                        alt={event.title}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isEnded ? "grayscale opacity-70" : ""}`}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-(--text-tertiary)">
                        <Calendar size={32} className="opacity-30" />
                        <span className="text-xs">No poster</span>
                    </div>
                )}

                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-linear-to-b from-black/90 via-transparent to-transparent" />

                {/* Top-left: price badge */}
                <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border backdrop-blur-sm ${isFree
                        ? "bg-(--badge-success-bg) text-(--badge-success-text) border-(--badge-success-border)"
                        : "bg-(--badge-primary-bg) text-(--badge-primary-text) border-(--badge-primary-border)"
                        }`}>
                        {isFree ? "Free" : `₹${event.ticketPrice?.toLocaleString("en-IN")}`}
                    </span>
                </div>

                {/* Top-right: status badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1">
                    {status.pulse && (
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--badge-success-text) opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-(--badge-success-text)" />
                        </span>
                    )}
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border backdrop-blur-sm ${status.style}`}>
                        {status.label}
                    </span>
                </div>

                {/* Bottom-left: format badge */}
                <div className="absolute bottom-3 left-3">
                    <span className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border backdrop-blur-sm ${isOnline
                        ? "bg-(--badge-info-bg) text-(--badge-info-text) border-(--badge-info-border)"
                        : "bg-(--badge-secondary-bg) text-(--badge-secondary-text) border-(--badge-secondary-border)"
                        }`}>
                        {isOnline ? <Wifi size={11} /> : <MapPin size={11} />}
                        {isOnline ? "Online" : "In-Person"}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 flex flex-col gap-3">

                {/* Category */}
                <div className="flex items-center gap-1.5 text-xs text-(--brand-primary) font-semibold uppercase tracking-wider">
                    <Tag size={12} />
                    {event.category}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-(--heading-primary) leading-snug line-clamp-2 group-hover:text-(--brand-primary) transition-colors duration-200">
                    {event.title}
                </h3>

                {/* Date & Location */}
                <div className="space-y-1.5 text-sm text-(--text-secondary)">
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-(--brand-primary) shrink-0" />
                        <span className="truncate">{formatDate(event.startDateTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-(--brand-primary) shrink-0" />
                        <span className="truncate">{isOnline ? "Virtual Event" : event.locationName || "Location TBA"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-(--brand-primary) shrink-0" />
                        <span className="truncate"> {event.soldTickets} attending </span>
                    </div>
                </div>

                {/* Seats bar — shown only when capacity available */}
                {seats && (
                    <div className="mt-auto pt-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs font-medium ${seats.color}`}>
                                {seats.label}
                            </span>
                            {seats.percent < 100 && (
                                <span className="text-xs text-(--text-tertiary)">
                                    <TrendingUp size={11} className="inline mr-1" />
                                    {Math.round(seats.percent)}% filled
                                </span>
                            )}
                        </div>
                        <div className="h-1.5 rounded-full bg-(--bg-tertiary) overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${seats.fillColor}`}
                                style={{ width: `${Math.min(seats.percent, 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-(--card-border) bg-(--bg-secondary) flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs text-(--text-tertiary)">
                    <Users size={13} />
                    <span className="truncate max-w-32">{event.organizer?.organizerName}</span>
                </div>
                <span className="text-sm font-semibold text-(--brand-primary) group-hover:underline underline-offset-2 transition-all">
                    View Details →
                </span>
            </div>
        </article>
    );
}

export default EventCard;