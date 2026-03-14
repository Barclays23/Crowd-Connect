import { EVENT_FORMATS, TICKET_TYPES, type IEventState } from "@/types/event.types";
import { MapPin, Tag, Users, Wifi, ArrowUpRight, Zap, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

function getStatusBadge(event: IEventState) {
    const now = new Date();
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    if (event.eventStatus === "cancelled")  return { label: "Cancelled",  pulse: false };
    if (event.eventStatus === "suspended")  return { label: "Suspended",  pulse: false };
    if (now > end || event.eventStatus === "completed") return { label: "Ended", pulse: false };
    if (now >= start && now <= end)         return { label: "Live Now",   pulse: true  };
    return                                         { label: "Upcoming",   pulse: false };
}

function getSeatsInfo(event: IEventState) {
    if (!event.capacity) return null;
    const remaining = event.capacity - (event.soldTickets ?? 0);
    const pct = ((event.soldTickets ?? 0) / event.capacity) * 100;
    if (remaining <= 0) return { label: "Sold Out",         color: "text-(--status-error)",       fill: "bg-(--status-error)",  pct: 100 };
    if (remaining <= 10) return { label: `${remaining} left`, color: "text-(--badge-warning-text)", fill: "bg-(--badge-warning-border)", pct };
    return                     { label: `${remaining} / ${event.capacity}`, color: "text-(--overlay-text)", fill: "bg-(--brand-primary)", pct };
}

export default function EventCard({ event }: { event: IEventState }) {
    if (!event) return null;

    const navigate  = useNavigate();
    const isFree    = event.ticketType === TICKET_TYPES.FREE;
    const isOnline  = event.format    === EVENT_FORMATS.ONLINE;
    const status    = getStatusBadge(event);
    const seats     = getSeatsInfo(event);
    const isEnded   = ["Ended", "Cancelled", "Suspended"].includes(status.label);

    const date   = new Date(event.startDateTime);
    const dayNum = date.getDate();
    const month  = date.toLocaleDateString(undefined, { month: "short" }).toUpperCase();
    const weekday= date.toLocaleDateString(undefined, { weekday: "long" });
    const time   = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

    /* glass panel base style */
    const glass = "backdrop-blur-md bg-(--bg-overlay2) border border-(--border-muted)";

    return (
        <article
            onClick={() => navigate(`/events/${event.eventId}`)}
            className="group cursor-pointer relative rounded-3xl overflow-hidden aspect-[3/4] transition-all duration-500
                hover:scale-[1.02] hover:shadow-2xl"
            style={{ isolation: "isolate" }}
        >
            {/* ── Full-bleed poster ── */}
            {event.posterUrl ? (
                <img
                    src={event.posterUrl}
                    alt={event.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700
                        group-hover:scale-110 ${isEnded ? "grayscale" : ""}`}
                />
            ) : (
                <div className="absolute inset-0 bg-(--bg-tertiary) flex items-center justify-center">
                    <CalendarDays size={56} className="opacity-10 text-(--text-primary)" />
                </div>
            )}

            {/* ── Gradient scrim — bottom heavy ── */}
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-black/10 pointer-events-none" />

            {/* ── TOP BAR ── status left / format right ── */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-2">
                {/* Status */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${glass}`}
                    style={{ color: "var(--overlay-text)" }}>
                    {status.pulse && (
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--badge-success-text) opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-(--badge-success-text)" />
                        </span>
                    )}
                    {status.label}
                </div>

                {/* Format */}
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${glass}`}
                    style={{ color: "var(--overlay-text)" }}>
                    {isOnline ? <Wifi size={10} /> : <MapPin size={10} />}
                    {isOnline ? "Online" : "In-Person"}
                </div>
            </div>

            {/* ── FLOATING DATE CHIP — top right overlap ── */}
            <div className={`absolute top-12 right-4 mt-2 flex flex-col items-center rounded-2xl px-3 py-2 min-w-[52px] ${glass}`}>
                <span className="text-2xl font-black leading-none" style={{ color: "var(--brand-primary)" }}>{dayNum}</span>
                <span className="text-[9px] font-black tracking-widest uppercase mt-0.5" style={{ color: "var(--overlay-text)" }}>{month}</span>
            </div>

            {/* ── PRICE RIBBON — diagonal corner ── */}
            <div
                className="absolute top-0 left-0 overflow-hidden pointer-events-none"
                style={{ width: 90, height: 90 }}
            >
                <div
                    className="absolute flex items-center justify-center font-black text-[11px] uppercase tracking-wider"
                    style={{
                        background: isFree ? "var(--badge-success-text)" : "var(--brand-primary)",
                        color: "var(--overlay-text)",
                        width: 120,
                        transformOrigin: "top left",
                        transform: "rotate(-45deg) translateX(-34px) translateY(8px)",
                        paddingTop: 4,
                        paddingBottom: 4,
                    }}
                >
                    {isFree ? "FREE" : `₹${event.ticketPrice?.toLocaleString("en-IN")}`}
                </div>
            </div>

            {/* ── BOTTOM GLASS PANEL ── */}
            <div className={`absolute bottom-4 inset-x-4 rounded-2xl p-4 ${glass} flex flex-col gap-3`}>

                {/* Category */}
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: "var(--brand-primary)" }}>
                    <Tag size={9} />
                    {event.category}
                </div>

                {/* Title */}
                <h3 className="text-base font-extrabold leading-snug line-clamp-2 transition-colors duration-200"
                    style={{ color: "var(--overlay-text)" }}>
                    {event.title}
                </h3>

                {/* Meta row */}
                <div className="flex items-center gap-3 text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                    <span className="flex items-center gap-1 truncate">
                        <CalendarDays size={11} style={{ color: "var(--brand-primary)" }} />
                        {weekday}, {time}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                        <Users size={11} style={{ color: "var(--brand-primary)" }} />
                        {event.soldTickets ?? 0}
                    </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-[11px] truncate" style={{ color: "rgba(255,255,255,0.7)" }}>
                    <MapPin size={11} style={{ color: "var(--brand-primary)" }} className="shrink-0" />
                    {isOnline ? "Virtual Event" : event.locationName || "Location TBA"}
                </div>

                {/* Seats bar + CTA row */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
                    {seats ? (
                        <div className="flex-1 flex flex-col gap-1">
                            <div className="flex justify-between text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                                <span className={seats.color}>{seats.label}</span>
                                <span>{Math.round(seats.pct)}% filled</span>
                            </div>
                            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.2)" }}>
                                <div className={`h-full rounded-full ${seats.fill}`} style={{ width: `${Math.min(seats.pct, 100)}%` }} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                            <span className="truncate max-w-28">{event.organizer?.organizerName}</span>
                        </div>
                    )}

                    {/* CTA button */}
                    <button
                        className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider
                            transition-all duration-200 group-hover:gap-2"
                        style={{
                            background: "var(--brand-primary)",
                            color: "var(--overlay-text)",
                        }}
                    >
                        Go
                        <ArrowUpRight size={12} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </button>
                </div>
            </div>
        </article>
    );
}