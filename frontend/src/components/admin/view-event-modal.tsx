// frontend/src/components/admin/ViewEventModal.tsx
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate2, formatDate1 } from "@/utils/dateAndTimeFormats";
import { Calendar, MapPin, Video, IndianRupee, Tag, Users, Ticket, AlertTriangle } from "lucide-react";
import type { IEventState } from "@/types/event.types";
import { getEventStatusBadgeVariant } from "@/utils/UI.utils";
import { capitalize } from "@/utils/namingConventions";
import { EventMap } from "@/components/common/EventMap";

interface ViewEventModalProps {
  event: IEventState;
}

export function ViewEventModal({ event }: ViewEventModalProps) {
   const isOnline = event.format?.toLowerCase() === "online";
   const isFree = event.ticketType?.toLowerCase() === "free";

   const remaining = (event.capacity ?? 0) - (event.soldTickets ?? 0);

   return (
      <div className="space-y-8 pb-4">
         {/* Hero Header */}
         <div className="space-y-5 rounded-xl bg-(--bg-accent) p-6 shadow-(--card-shadow)">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
               <div className="space-y-3 flex-1">
                  <h3 className="text-2xl sm:text-3xl font-bold text-(--heading-primary) tracking-tight">
                     {event.title}
                  </h3>

                  {/* Category */}
                  {event.category && (
                     <div className="flex items-center gap-2 text-sm text-(--text-secondary)">
                        <Tag className="h-4 w-4" />
                        <span className="font-medium">{capitalize(event.category)}</span>
                     </div>
                  )}

                  {/* Organized by – moved here */}
                  {event.organizer?.organizerName && (
                     <div className="text-sm text-(--text-secondary) mt-1">
                        Organized by{" "}
                        <span className="font-medium text-(--text-primary)">
                           {event.organizer.organizerName}
                        </span>
                        {event.organizer.hostName && event.organizer.hostName !== event.organizer.organizerName && (
                           <span className="text-(--text-tertiary)">
                              {" "}({event.organizer.hostName})
                           </span>
                        )}
                     </div>
                  )}
               </div>

               {/* Badges – stay on the right */}
               <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                  <Badge
                     variant={getEventStatusBadgeVariant(event.eventStatus)}
                     className="rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wide"
                  >
                     {capitalize(event.eventStatus)}
                  </Badge>
                  <Badge
                     variant={isOnline ? "secondary" : "default"}
                     className="rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wide"
                  >
                     {capitalize(event.format)}
                  </Badge>
                  <Badge
                     variant={isFree ? "success" : "destructive"}
                     className="rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wide"
                  >
                     {isFree ? "Free" : "Paid"}
                  </Badge>
               </div>
            </div>

            {/* Quick dates */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-(--text-secondary)">
               <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                     {formatDate2(event.startDateTime)} – {formatDate2(event.endDateTime)}
                  </span>
               </div>
            </div>
         </div>

         <Separator className="bg-(--border-muted)" />

         {/* Main two-column content */}
         <div className="grid gap-8 lg:grid-cols-5">
            {/* Left – main info (takes more space) */}
            <div className="lg:col-span-3 space-y-8">
               {/* Description */}
               <section>
                  <h4 className="mb-3 text-lg font-semibold text-(--heading-primary)">Description</h4>
                  <p className="text-sm whitespace-pre-line leading-relaxed text-(--text-primary)">
                  {event.description || "No description provided."}
                  </p>
               </section>

               {/* Cancellation Section */}
               {((event.eventStatus === "cancelled" || event.eventStatus === "suspended") && event.cancellation) && (
                  <section>
                     <h4 className="mb-3 text-lg font-semibold text-(--status-error)">
                        Cancellation Reason
                     </h4>

                     <div className="rounded-lg border border-(--status-error)/40 bg-(--status-error-bg) p-4">
                        <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-(--status-error)" />
                        <p className="text-xs whitespace-pre-line leading-relaxed text-(--text-primary)">
                           {event?.cancellation?.reason}
                        </p>
                     </div>
                  </section>
               )}



               {/* Location / Online link */}
               <section>
               <h4 className="mb-3 text-lg font-semibold text-(--heading-primary)">
                  {isOnline ? "Meeting Link" : "Venue"}
               </h4>

               {isOnline ? (
                  <div className="flex items-start gap-3 rounded-lg border border-(--border-muted) bg-(--bg-primary)/50 p-4">
                     <Video className="mt-1 h-5 w-5 shrink-0 text-(--brand-primary)" />
                     <p className="break-all leading-relaxed text-(--text-primary)">
                     {event.onlineLink ? (
                        <a
                           href={event.onlineLink}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-(--brand-primary) hover:underline"
                        >
                           {event.onlineLink}
                        </a>
                     ) : (
                        "Not provided"
                     )}
                     </p>
                  </div>
               ) : (
                  <div className="space-y-3">
                        <div className="flex items-start gap-3 rounded-lg border border-(--border-muted) bg-(--bg-primary)/50 p-4">
                        <MapPin className="mt-1 h-5 w-5 shrink-0 text-(--brand-primary)" />
                        <div className="flex-1">
                           <p className="font-medium text-(--text-primary)">
                              {event.locationName || "Not specified"}
                           </p>
                           {event.location?.coordinates && event.location.coordinates.length === 2 && (
                              <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg border border-(--border-muted) shadow-sm">
                                 <EventMap
                                    lat={event.location.coordinates[1]} // GeoJSON = [lng, lat] ← reverse!
                                    lng={event.location.coordinates[0]}
                                    name={event.locationName || event.title}
                                 />
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               )}
               </section>
               
            </div>

            {/* Right – stats sidebar */}
            <div className="lg:col-span-2 space-y-6 lg:pl-6 lg:border-l border-(--border-muted)">
               <div className="rounded-xl bg-(--bg-primary) p-5 shadow-(--card-shadow)">
                  <h4 className="mb-4 text-lg font-semibold text-(--heading-primary)">Event Stats</h4>

                  <div className="space-y-5">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-(--status-info-bg) p-2.5">
                        <IndianRupee className="h-5 w-5 text-(--brand-primary)" />
                        </div>
                        <div>
                        <p className="text-sm text-(--text-tertiary)">Ticket Price</p>
                        <p className="text-xl font-bold text-(--text-primary)">
                           {isFree ? "Free" : `₹${(event.ticketPrice || 0).toLocaleString("en-IN")}`}
                        </p>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-(--status-success-bg) p-2.5">
                        <IndianRupee className="h-5 w-5 text-(--status-success)" />
                        </div>
                        <div>
                        <p className="text-sm text-(--text-tertiary)">Gross Revenue</p>
                        <p className="text-xl font-bold text-(--status-success)">
                           ₹{(event.grossTicketRevenue || 0).toLocaleString("en-IN")}
                        </p>
                        </div>
                     </div>
                  </div>

                  <Separator className="bg-(--border-muted)" />

                  <div className="grid grid-cols-3 gap-4 text-center">
                     <div>
                        <p className="text-sm text-(--text-tertiary)">Seats</p>
                        <p className="mt-1 text-2xl font-bold text-(--text-primary)">
                        {event.capacity ?? "—"}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm text-(--text-tertiary)">Sold</p>
                        <p className="mt-1 text-2xl font-bold text-(--text-primary)">
                        {event.soldTickets ?? "—"}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm text-(--text-tertiary)">Left</p>
                        <p className="mt-1 text-2xl font-bold text-(--status-info)">
                        {remaining > 0 ? remaining : "Sold Out"}
                        </p>
                     </div>
                  </div>
                  </div>
               </div>

               {/* Timestamps */}
               <div className="text-sm text-(--text-tertiary) space-y-2">
                  <div>
                  Created: <span className="text-(--text-primary)">{formatDate1(event.createdAt) || "—"}</span>
                  </div>
                  {event.updatedAt && (
                  <div>
                     Last updated: <span className="text-(--text-primary)">{formatDate1(event.updatedAt)}</span>
                  </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}