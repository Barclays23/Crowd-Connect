// frontend/src/components/admin/view-event-modal.tsx
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate3, formatDate1 } from "@/utils/dateAndTimeFormats";
import {
    Calendar, MapPin, Video, IndianRupee,
    Ticket, AlertTriangle, Clock, TrendingUp,
    ImageOff, UserCircle, LayoutList, Users,
} from "lucide-react";
import type { IEventState } from "@/types/event.types";
import { getEventCategoryBadgeVariant, getEventStatusBadgeVariant } from "@/utils/UI.utils";
import { capitalize } from "@/utils/namingConventions";
import { EventMap } from "@/components/common/EventMap";
import { EventBookingsList } from "./event-bookings-list";

interface ViewEventModalProps {
    event: IEventState;
}

type Tab = "overview" | "bookings";

export function ViewEventModal({ event }: ViewEventModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>("overview");

    const isOnline    = event.format?.toLowerCase() === "online";
    const isFree      = event.ticketType?.toLowerCase() === "free";
    const isCancelled = event.eventStatus === "cancelled" || event.eventStatus === "suspended";
    const sold        = event.soldTickets ?? 0;
    const capacity    = event.capacity ?? 0;
    const remaining   = capacity - sold;
    const fillPct     = capacity > 0 ? Math.min(100, Math.round((sold / capacity) * 100)) : 0;

    const fillBarColor =
        fillPct >= 100 ? "bg-(--status-error)"  :
        fillPct >= 80  ? "bg-(--status-warning)" :
                         "bg-(--brand-primary)";

    const remainingColor =
        remaining <= 0  ? "text-(--status-error)"  :
        remaining <= 10 ? "text-(--status-warning)" :
                          "text-(--status-success)";

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: "overview",  label: "Overview",  icon: <LayoutList size={15} /> },
        { key: "bookings", label: "Bookings", icon: <Users size={15} /> },
    ];

    return (
        <div className="space-y-0 pb-2 text-(--text-primary)">

            {/* ── POSTER HERO ──────────────────────────────────────────────── */}
            <div className="relative rounded-2xl overflow-hidden mb-6 bg-(--bg-tertiary) border border-(--card-border)">
                {event.posterUrl ? (
                    <img
                        src={event.posterUrl}
                        alt={event.title}
                        className={["w-full object-cover", isCancelled ? "grayscale-[0.6] brightness-75" : "brightness-60"].join(" ")}
                        style={{ maxHeight: 280 }}
                    />
                ) : (
                    <div className="w-full h-40 flex flex-col items-center justify-center gap-3 text-(--text-tertiary)">
                        <ImageOff size={36} className="opacity-30" />
                        <span className="text-xs tracking-widest uppercase opacity-50">No poster</span>
                    </div>
                )}

                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 40%, transparent 100%)" }} />

                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant={getEventStatusBadgeVariant(event.eventStatus)} className="rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                            {capitalize(event.eventStatus)}
                        </Badge>
                        <Badge variant={isOnline ? "secondary" : "default"} className="rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                            {capitalize(event.format)}
                        </Badge>
                        <Badge variant={isFree ? "success" : "destructive"} className="rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                            {isFree ? "Free" : `₹${(event.ticketPrice || 0).toLocaleString("en-IN")}`}
                        </Badge>
                        {event.category && (
                            <Badge variant={getEventCategoryBadgeVariant(event.category)} className="rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                                {capitalize(event.category)}
                            </Badge>
                        )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
                        {event.title}
                    </h2>

                    {event.organizer?.organizerName && (
                        <div className="flex items-center gap-2 mt-2">
                            <UserCircle size={14} className="text-white opacity-60" />
                            <span className="text-sm text-white/70">
                                {event.organizer.organizerName}
                                {event.organizer.hostName && event.organizer.hostName !== event.organizer.organizerName && (
                                    <span className="opacity-50"> · {event.organizer.hostName}</span>
                                )}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── QUICK STATS — always visible ─────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { icon: <Calendar size={15} />,    label: "Starts",        value: formatDate3(event.startDateTime) || "—", highlight: false },
                    { icon: <Clock size={15} />,       label: "Ends",          value: formatDate3(event.endDateTime)   || "—", highlight: false },
                    { icon: <Ticket size={15} />,      label: "Tickets Sold",  value: `${sold} / ${capacity || "—"}`,          highlight: true  },
                    { icon: <IndianRupee size={15} />, label: "Gross Revenue", value: `₹${(event.grossTicketRevenue || 0).toLocaleString("en-IN")}`, highlight: true },
                ].map((item, i) => (
                    <div key={i} className="rounded-xl p-3.5 flex flex-col gap-1.5 bg-(--bg-secondary) border border-(--card-border)">
                        <div className="flex items-center gap-1.5 text-(--brand-primary) text-[11px] font-bold uppercase tracking-[0.08em]">
                            {item.icon} {item.label}
                        </div>
                        <div className={`text-sm font-bold truncate ${item.highlight ? "text-(--status-success)" : "text-(--text-primary)"}`}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── TAB BAR ──────────────────────────────────────────────────── */}
            <div className="flex gap-1 p-1 rounded-xl bg-(--bg-secondary) border border-(--card-border) mb-6 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={[
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer",
                            activeTab === tab.key
                                ? "bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-(--heading-primary) shadow-sm"
                                : "text-(--text-tertiary) hover:bg-(--bg-accent) hover:text-(--text-secondary)",
                        ].join(" ")}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.key === "bookings" && sold > 0 && (
                            <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-(--brand-primary-light) text-(--text-inverse)">
                                {sold}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
            {activeTab === "overview" && (
                <div className="grid gap-6 lg:grid-cols-5">

                    {/* Left */}
                    <div className="lg:col-span-3 space-y-6">

                        <Section title="About this Event">
                            <p className="text-sm leading-relaxed whitespace-pre-line text-(--text-secondary)">
                                {event.description || "No description provided."}
                            </p>
                        </Section>

                        {isCancelled && event.cancellation?.reason && (
                            <div className="rounded-xl p-4 flex items-start gap-3 bg-(--badge-danger-bg) border border-(--border-brand)">
                                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-(--brand-primary)" />
                                <div>
                                    <p className="text-sm font-semibold mb-1 text-(--badge-danger-text)">{capitalize(event.eventStatus)} Reason</p>
                                    <p className="text-sm leading-relaxed text-(--badge-danger-text) opacity-85">{event.cancellation.reason}</p>
                                </div>
                            </div>
                        )}

                        <Section title={isOnline ? "Meeting Link" : "Venue & Location"}>
                            {isOnline ? (
                                <div className="flex items-start gap-3 rounded-xl p-4 bg-(--bg-primary) border border-(--card-border)">
                                    <Video size={18} className="shrink-0 mt-0.5 text-(--brand-primary)" />
                                    {event.onlineLink ? (
                                        <a href={event.onlineLink} target="_blank" rel="noopener noreferrer" className="text-sm break-all text-(--brand-primary) hover:underline">
                                            {event.onlineLink}
                                        </a>
                                    ) : (
                                        <span className="text-sm text-(--text-tertiary)">Not provided</span>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 rounded-xl p-4 bg-(--bg-secondary) border border-(--card-border)">
                                        <MapPin size={18} className="shrink-0 text-(--brand-primary)" />
                                        <div>
                                            <p className="text-sm font-semibold text-(--text-primary)">{event.locationName || "Not specified"}</p>
                                            {event.location?.coordinates && (
                                                <p className="text-xs mt-0.5 text-(--text-tertiary)">
                                                    {event.location.coordinates[1].toFixed(5)}, {event.location.coordinates[0].toFixed(5)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {event.location?.coordinates?.length === 2 && (
                                        <div className="rounded-xl overflow-hidden border border-(--card-border)">
                                            <EventMap lat={event.location.coordinates[1]} lng={event.location.coordinates[0]} locationName={event.locationName || event.title} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </Section>
                    </div>

                    {/* Right */}
                    <div className="lg:col-span-2 space-y-5">

                        <div className="rounded-xl p-5 space-y-4 bg-(--bg-secondary) border border-(--card-border)">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-(--text-tertiary)">Availability</h4>
                                <TrendingUp size={15} className="text-(--brand-primary)" />
                            </div>
                            <div className="grid grid-cols-3 text-center gap-2">
                                {[
                                    { label: "Total", value: capacity || "—", className: "text-(--text-primary)"  },
                                    { label: "Sold",  value: sold,            className: "text-(--brand-primary)" },
                                    { label: "Left",  value: remaining > 0 ? remaining : "Sold out", className: remainingColor },
                                ].map((s, i) => (
                                    <div key={i} className="rounded-lg py-3 bg-(--bg-primary)">
                                        <div className="text-xs mb-1 text-(--text-tertiary) tracking-[0.07em]">{s.label}</div>
                                        <div className={`text-xl font-extrabold ${s.className}`}>{s.value}</div>
                                    </div>
                                ))}
                            </div>
                            {capacity > 0 && (
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-(--text-tertiary)">Fill rate</span>
                                        <span className="font-semibold text-(--text-primary)">{fillPct}%</span>
                                    </div>
                                    <div className="h-2 rounded-full overflow-hidden bg-(--bg-tertiary)">
                                        <div className={`h-full rounded-full transition-all duration-700 ${fillBarColor}`} style={{ width: `${fillPct}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl p-5 space-y-4 bg-(--bg-secondary) border border-(--card-border)">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-(--text-tertiary)">Financials</h4>
                            <div className="space-y-3">
                                <FinRow icon={<Ticket size={15} />} label="Ticket Price"
                                    value={isFree ? "Free" : `₹${(event.ticketPrice || 0).toLocaleString("en-IN")}`} />
                                <Separator className="bg-(--border-muted)" />
                                <FinRow icon={<IndianRupee size={15} />} label="Gross Revenue"
                                    value={`₹${(event.grossTicketRevenue || 0).toLocaleString("en-IN")}`}
                                    valueClassName="text-(--status-success) font-bold" />
                            </div>
                        </div>

                        <div className="rounded-xl p-5 space-y-2.5 bg-(--bg-secondary) border border-(--card-border)">
                            <h4 className="text-sm font-bold uppercase tracking-widest mb-3 text-(--text-tertiary)">Record Info</h4>
                            <MetaRow label="Event ID"     value={(event.eventId?.slice(0, 16) ?? "") + "…"} mono />
                            <MetaRow label="Created"      value={formatDate1(event.createdAt) || "—"} />
                            {event.updatedAt && <MetaRow label="Last updated" value={formatDate1(event.updatedAt)} />}
                        </div>
                    </div>
                </div>
            )}

            {/* ── BOOKINGS TAB ─────────────────────────────────────────────── */}
            {activeTab === "bookings" && (
                <EventBookingsList eventId={event.eventId} />
            )}
        </div>
    );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h4 className="text-base font-bold text-(--heading-primary)">{title}</h4>
            {children}
        </section>
    );
}

function FinRow({ icon, label, value, valueClassName = "" }: {
    icon: React.ReactNode; label: string; value: string; valueClassName?: string;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-(--text-secondary)">
                <span className="text-(--brand-primary)">{icon}</span>
                {label}
            </div>
            <span className={`text-sm font-semibold text-(--text-primary) ${valueClassName}`}>{value}</span>
        </div>
    );
}

function MetaRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-4 text-xs">
            <span className="text-(--text-tertiary)">{label}</span>
            <span className={`text-(--text-secondary) text-right ${mono ? "font-mono" : ""}`}>{value}</span>
        </div>
    );
}