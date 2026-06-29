// frontend/src/components/event/EventOverview.tsx

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate3, formatDate1 } from "@/utils/dateAndTimeFormats";
import {
   Calendar, MapPin, Video, IndianRupee,
   Ticket, AlertTriangle, Clock, TrendingUp,
   ImageOff, UserCircle,
} from "lucide-react";
import type { IEventState } from "@/types/event.types";
import { getEventCategoryBadgeVariant, getEventStatusBadgeVariant } from "@/utils/UI.utils";
import { capitalize } from "@/utils/namingConventions";
import { EventMap } from "@/components/common/EventMap";

interface EventOverviewProps {
   event: IEventState;
}

export default function EventOverview({ event }: EventOverviewProps) {
   const isOnline = event.format?.toLowerCase() === "online";
   const isFree = event.ticketType?.toLowerCase() === "free";
   const isCancelled = event.eventStatus === "cancelled" || event.eventStatus === "suspended";
   const sold = event.soldTickets ?? 0;
   const capacity = event.capacity ?? 0;
   const remaining = capacity - sold;
   const fillPct = capacity > 0 ? Math.min(100, Math.round((sold / capacity) * 100)) : 0;

   const fillBarColor =
      fillPct >= 100 ? "bg-(--status-error)" :
      fillPct >= 80 ? "bg-(--status-warning)" :
      "bg-(--brand-primary)";

   const remainingColor =
      remaining <= 0 ? "text-(--status-error)" :
      remaining <= 10 ? "text-(--status-warning)" :
      "text-(--status-success)";

   return (
      <div className="space-y-6 pb-6 text-(--text-primary)">
         {/* POSTER HERO */}
         <div className="relative rounded-2xl overflow-hidden mb-8 bg-(--bg-tertiary) border border-(--card-border)">
            {event.posterUrl ? (
               <img
                  src={event.posterUrl}
                  alt={event.title}
                  className={["w-full object-cover", isCancelled ? "grayscale-[0.6] brightness-75" : "brightness-60"].join(" ")}
                  style={{ maxHeight: 320 }}
               />
            ) : (
               <div className="w-full h-48 flex flex-col items-center justify-center gap-3 text-(--text-tertiary)">
                  <ImageOff size={40} className="opacity-30" />
                  <span className="text-xs tracking-widest uppercase opacity-50">No poster provided</span>
               </div>
            )}

            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 30%, transparent 100%)" }} />

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
               <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant={getEventStatusBadgeVariant(event.eventStatus)} className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
                     {capitalize(event.eventStatus)}
                  </Badge>
                  <Badge variant={isOnline ? "secondary" : "default"} className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
                     {capitalize(event.format)}
                  </Badge>
                  <Badge variant={isFree ? "success" : "destructive"} className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
                     {isFree ? "Free" : `₹${(event.ticketPrice || 0).toLocaleString("en-IN")}`}
                  </Badge>
                  {event.category && (
                     <Badge variant={getEventCategoryBadgeVariant(event.category)} className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        {capitalize(event.category)}
                     </Badge>
                  )}
               </div>

               <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
                  {event.title}
               </h2>

               {event.organizer?.organizerName && (
                  <div className="flex items-center gap-2 mt-3">
                     <UserCircle size={16} className="text-white opacity-70" />
                     <span className="text-sm text-white/80 font-medium">
                        {event.organizer.organizerName}
                        {event.organizer.hostName && event.organizer.hostName !== event.organizer.organizerName && (
                           <span className="opacity-60"> · {event.organizer.hostName}</span>
                        )}
                     </span>
                  </div>
               )}
            </div>
         </div>

         {/* QUICK STATS */}
         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
               { icon: <Calendar size={18} />, label: "Starts", value: formatDate3(event.startDateTime) || "—", highlight: false },
               { icon: <Clock size={18} />, label: "Ends", value: formatDate3(event.endDateTime) || "—", highlight: false },
               { icon: <Ticket size={18} />, label: "Tickets Sold", value: `${sold} / ${capacity || "—"}`, highlight: true },
               { icon: <IndianRupee size={18} />, label: "Gross Revenue", value: `₹${(event.grossTicketRevenue || 0).toLocaleString("en-IN")}`, highlight: true },
            ].map((item, i) => (
               <div key={i} className="rounded-xl p-5 flex flex-col gap-2 bg-(--bg-secondary) border border-(--card-border) shadow-sm">
                  <div className="flex items-center gap-2 text-(--brand-primary) text-xs font-bold uppercase tracking-widest">
                     {item.icon} {item.label}
                  </div>
                  <div className={`text-base sm:text-lg font-bold truncate ${item.highlight ? "text-(--status-success)" : "text-(--text-primary)"}`}>
                     {item.value}
                  </div>
               </div>
            ))}
         </div>

         {/* CONTENT GRID */}
         <div className="grid gap-8 lg:grid-cols-5">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-8">
               <Section title="About this Event">
                  <p className="text-base leading-relaxed whitespace-pre-line text-(--text-secondary)">
                     {event.description || "No description provided."}
                  </p>
               </Section>

               {isCancelled && event.cancellation?.reason && (
                  <div className="rounded-xl p-5 flex items-start gap-4 bg-(--badge-danger-bg) border border-(--border-brand)">
                     <AlertTriangle size={24} className="mt-1 shrink-0 text-(--brand-primary)" />
                     <div>
                        <p className="text-base font-bold mb-1 text-(--badge-danger-text)">{capitalize(event.eventStatus)} Reason</p>
                        <p className="text-sm leading-relaxed text-(--badge-danger-text) opacity-90">{event.cancellation.reason}</p>
                     </div>
                  </div>
               )}

               <Section title={isOnline ? "Meeting Link" : "Venue & Location"}>
                  {isOnline ? (
                     <div className="flex items-start gap-3 rounded-xl p-5 bg-(--bg-primary) border border-(--card-border)">
                        <Video size={20} className="shrink-0 mt-0.5 text-(--brand-primary)" />
                        {event.onlineLink ? (
                           <a href={event.onlineLink} target="_blank" rel="noopener noreferrer" className="text-base font-medium break-all text-(--brand-primary) hover:underline">
                              {event.onlineLink}
                           </a>
                        ) : (
                           <span className="text-base text-(--text-tertiary)">Not provided</span>
                        )}
                     </div>
                  ) : (
                     <div className="space-y-4">
                        <div className="flex items-center gap-4 rounded-xl p-5 bg-(--bg-secondary) border border-(--card-border)">
                           <MapPin size={24} className="shrink-0 text-(--brand-primary)" />
                           <div>
                              <p className="text-base font-bold text-(--text-primary)">{event.locationName || "Not specified"}</p>
                              {event.location?.coordinates && (
                                 <p className="text-sm mt-1 text-(--text-tertiary) font-mono">
                                    {event.location.coordinates[1].toFixed(5)}, {event.location.coordinates[0].toFixed(5)}
                                 </p>
                              )}
                           </div>
                        </div>
                        {event.location?.coordinates?.length === 2 && (
                           <div className="rounded-xl overflow-hidden border border-(--card-border) h-64">
                              <EventMap lat={event.location.coordinates[1]} lng={event.location.coordinates[0]} locationName={event.locationName || event.title} />
                           </div>
                        )}
                     </div>
                  )}
               </Section>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
               <div className="rounded-xl p-6 space-y-5 bg-(--bg-secondary) border border-(--card-border) shadow-sm">
                  <div className="flex items-center justify-between">
                     <h4 className="text-sm font-bold uppercase tracking-widest text-(--text-tertiary)">Availability</h4>
                     <TrendingUp size={18} className="text-(--brand-primary)" />
                  </div>
                  <div className="grid grid-cols-3 text-center gap-3">
                     {[
                        { label: "Total", value: capacity || "—", className: "text-(--text-primary)" },
                        { label: "Sold", value: sold, className: "text-(--brand-primary)" },
                        { label: "Left", value: remaining > 0 ? remaining : "Sold out", className: remainingColor },
                     ].map((s, i) => (
                        <div key={i} className="rounded-xl py-4 bg-(--bg-primary) border border-(--border-muted)">
                           <div className="text-xs mb-1.5 text-(--text-tertiary) font-bold tracking-wider uppercase">{s.label}</div>
                           <div className={`text-2xl font-black ${s.className}`}>{s.value}</div>
                        </div>
                     ))}
                  </div>
                  {capacity > 0 && (
                     <div className="pt-2">
                        <div className="flex justify-between text-sm mb-2 font-medium">
                           <span className="text-(--text-tertiary)">Fill rate</span>
                           <span className="text-(--text-primary)">{fillPct}%</span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden bg-(--bg-tertiary)">
                           <div className={`h-full rounded-full transition-all duration-1000 ease-in-out ${fillBarColor}`} style={{ width: `${fillPct}%` }} />
                        </div>
                     </div>
                  )}
               </div>

               <div className="rounded-xl p-6 space-y-5 bg-(--bg-secondary) border border-(--card-border) shadow-sm">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-(--text-tertiary)">Financials</h4>
                  <div className="space-y-4">
                     <FinRow icon={<Ticket size={16} />} label="Ticket Price" value={isFree ? "Free" : `₹${(event.ticketPrice || 0).toLocaleString("en-IN")}`} />
                     <Separator className="bg-(--border-muted)" />
                     <FinRow 
                        icon={<IndianRupee size={16} />} 
                        label="Gross Revenue" 
                        value={`₹${(event.grossTicketRevenue || 0).toLocaleString("en-IN")}`} 
                        valueClassName="text-(--status-success) text-lg font-black" 
                     />
                  </div>
               </div>

               <div className="rounded-xl p-6 space-y-4 bg-(--bg-secondary) border border-(--card-border) shadow-sm">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-(--text-tertiary)">Record Info</h4>
                  <MetaRow label="Event ID" value={event.eventId} mono />
                  <MetaRow label="Created" value={formatDate1(event.createdAt) || "—"} />
                  {event.updatedAt && <MetaRow label="Last updated" value={formatDate1(event.updatedAt)} />}
               </div>
            </div>
         </div>
      </div>
   );
}

// Sub-components for styling
function Section({ title, children }: { title: string; children: React.ReactNode }) {
   return (
      <section className="space-y-4">
         <h4 className="text-xl font-bold text-(--heading-primary) border-b border-(--border-muted) pb-2">{title}</h4>
         {children}
      </section>
   );
}

function FinRow({ icon, label, value, valueClassName = "font-bold text-base" }: { icon: React.ReactNode; label: string; value: string; valueClassName?: string; }) {
   return (
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2.5 text-sm font-medium text-(--text-secondary)">
            <span className="text-(--brand-primary) bg-(--bg-primary) p-1.5 rounded-md">{icon}</span>
            {label}
         </div>
         <span className={`text-(--text-primary) ${valueClassName}`}>{value}</span>
      </div>
   );
}

function MetaRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
   return (
      <div className="flex items-center justify-between gap-4">
         <span className="text-sm font-medium text-(--text-tertiary)">{label}</span>
         <span className={`text-sm text-(--text-secondary) text-right ${mono ? "font-mono bg-(--bg-primary) px-2 py-0.5 rounded border border-(--border-muted)" : ""}`}>
            {value}
         </span>
      </div>
   );
}