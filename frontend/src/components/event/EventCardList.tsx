import type { IEventState } from "@/types/event.types";
import { CalendarX, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";


function EventCardList({ event }: { event: IEventState }) {
    const navigate = useNavigate();
    const isFree = event.ticketType === "free";
    const isOnline = event.format === "online";

    return (
        <div
            onClick={() => navigate(`/events/${event.eventId}`)}
            className="group cursor-pointer flex gap-4 bg-(--card-bg) border border-(--card-border) rounded-2xl overflow-hidden
               shadow-(--shadow-xs) hover:shadow-(--shadow-sm) hover:border-(--brand-primary) transition-all duration-200 p-4"
        >
            {/* Thumbnail */}
            <div className="w-28 h-24 rounded-xl overflow-hidden shrink-0 bg-(--bg-tertiary)">
                {event.posterUrl ? (
                    <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-(--text-tertiary)">
                        <CalendarX size={20} className="opacity-30" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <span className="text-xs font-semibold text-(--brand-primary) uppercase tracking-wider">{event.category}</span>
                    <h3 className="text-base font-bold text-(--heading-primary) line-clamp-1 mt-0.5 group-hover:text-(--brand-primary) transition-colors">
                        {event.title}
                    </h3>
                    <p className="text-xs text-(--text-secondary) mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Clock size={12} />{new Date(event.startDateTime).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} />{isOnline ? "Online" : event.locationName || "TBA"}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${isFree ? "bg-(--badge-success-bg) text-(--badge-success-text) border-(--badge-success-border)" : "bg-(--badge-primary-bg) text-(--badge-primary-text) border-(--badge-primary-border)"}`}>
                        {isFree ? "Free" : `₹${event.ticketPrice?.toLocaleString("en-IN")}`}
                    </span>
                    <span className="text-xs text-(--text-tertiary)">by {event.organizer?.organizerName}</span>
                </div>
            </div>

            {/* Right arrow */}
            <div className="flex items-center pr-1">
                <span className="text-(--text-tertiary) group-hover:text-(--brand-primary) group-hover:translate-x-1 transition-all duration-200 text-lg">→</span>
            </div>
        </div>
    );
}


export default EventCardList;