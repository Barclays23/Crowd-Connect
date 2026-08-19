// frontend/src/pages/event/OrgainiserEventDashboard.tsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LayoutList, Users, ScanLine, ArrowLeft, Star, ImageOff, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner1 } from "@/components/shared/LoadingSpinner1";
import { eventServices } from "@/services/eventServices";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import type { IEventState } from "@/types/event.types";
import { getEventStatusBadgeVariant, getEventCategoryBadgeVariant } from "@/utils/UI.utils";
import { capitalize } from "@/utils/namingConventions";

import EventOverview from "@/components/event/EventOverview";
import { EventBookingsList } from "@/components/admin/event-bookings-list";
import { EventCheckIn } from "@/components/checkin/EventCheckIn";
import ReviewsSection from "@/components/review/ReviewsSection";
import type { ApiResponse } from "@/types/common.types";
import { StarRating } from "@/components/shared/StarRating";

type Tab = "overview" | "bookings" | "checkin" | "reviews";

export default function OrgainiserEventDashboard() {
   const { eventId } = useParams<{ eventId: string }>();
   const navigate = useNavigate();

   const [activeTab, setActiveTab] = useState<Tab>("overview");
   const [event, setEvent] = useState<IEventState | null>(null);
   const [loading, setLoading] = useState<boolean>(true);

   const fetchEventDetails = useCallback(async () => {
      if (!eventId) return;
      setLoading(true);

      try {
         const response: ApiResponse<IEventState> = await eventServices.getEventDetails(eventId);
         setEvent(response.data);
      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);
         navigate(-1); 
      } finally {
         setLoading(false);
      }
   }, [eventId, navigate]);

   useEffect(() => {
      fetchEventDetails();
   }, [fetchEventDetails]);

   if (loading) {
      return (
         <div className="flex h-[60vh] items-center justify-center">
            <LoadingSpinner1 size="lg" message="Loading event workspace..." />
         </div>
      );
   }

   if (!event) return null;

   const sold = event.soldTickets ?? 0;
   const isPastEvent = new Date(event.endDateTime) < new Date() || event.eventStatus === "completed";
   const isCancelled = event.eventStatus === "cancelled" || event.eventStatus === "suspended";
   const isOnline = event.format?.toLowerCase() === "online";
   const isFree = event.ticketType?.toLowerCase() === "free";

   const tabs: { key: Tab; label: string; icon: React.ReactNode; hidden?: boolean }[] = [
      { key: "overview", label: "Overview", icon: <LayoutList size={15} /> },
      { key: "bookings", label: "Bookings", icon: <Users size={15} /> },
      { key: "checkin", label: "Check-In", icon: <ScanLine size={15} /> },
      { key: "reviews", label: "Reviews", icon: <Star size={15} />, hidden: !isPastEvent }, 
   ];

   return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
         {/* Navigation Header */}
         <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} title="Go Back">
               <ArrowLeft className="h-5 w-5 text-(--text-secondary)" />
            </Button>
            <div>
               <h1 className="text-2xl font-bold tracking-tight text-(--heading-primary)">Workspace</h1>
               <p className="text-sm text-(--text-secondary)">Manage details, bookings, and gate entry</p>
            </div>
         </div>

         {/* ── POSTER HERO ── */}
         <div className="relative rounded-2xl overflow-hidden bg-(--bg-tertiary) border border-(--card-border) shadow-sm">
            {event.posterUrl ? (
               <img
                  src={event.posterUrl}
                  alt={event.title}
                  className={["w-full object-cover", isCancelled ? "grayscale-[0.6] brightness-75" : "brightness-60"].join(" ")}
                  style={{ maxHeight: 280 }}
               />
            ) : (
               <div className="w-full h-48 flex flex-col items-center justify-center gap-3 text-(--text-tertiary)">
                  <ImageOff size={40} className="opacity-30" />
                  <span className="text-xs tracking-widest uppercase opacity-50">No poster provided</span>
               </div>
            )}

            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 10%, transparent 100%)" }} />

            <div className="absolute bottom-0 left-0 right-0 p-6">
               <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                     <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant={getEventStatusBadgeVariant(event.eventStatus)} className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                           {capitalize(event.eventStatus)}
                        </Badge>
                        <Badge variant={isOnline ? "secondary" : "default"} className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                           {capitalize(event.format)}
                        </Badge>
                        <Badge variant={isFree ? "success" : "destructive"} className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                           {isFree ? "Free" : `₹${(event.ticketPrice || 0).toLocaleString("en-IN")}`}
                        </Badge>
                        {event.category && (
                           <Badge variant={getEventCategoryBadgeVariant(event.category)} className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                              {capitalize(event.category)}
                           </Badge>
                        )}
                     </div>

                     <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
                        {event.title}
                     </h2>

                     {event.organizer?.organizationName && (
                        <div className="flex items-center gap-2 mt-2">
                           <UserCircle size={16} className="text-white opacity-70" />
                           <span className="text-sm text-white/80 font-medium">{event.organizer.organizationName}</span>
                        </div>
                     )}
                  </div>

                  {/* Rating Block */}
                  {event.ratingAverage > 0 && (
                     <div className="flex flex-col items-center justify-center shrink-0 bg-black/40 backdrop-blur-md border border-white/20 p-3 sm:px-5 rounded-xl">
                        <span className="text-xl sm:text-2xl font-black text-white leading-none mb-1.5">
                           {event.ratingAverage.toFixed(1)}
                        </span>
                        <StarRating 
                           rating={event.ratingAverage} 
                           size={14} 
                           className="text-(--badge-warning-text)" 
                           emptyColorClassName="text-white/20" 
                        />
                        <span className="text-[10px] text-white/70 font-medium tracking-wide uppercase mt-1.5">
                           {event.totalReviews} {event.totalReviews === 1 ? "Review" : "Reviews"}
                        </span>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Page Tab Bar */}
         <div className="flex gap-1 p-1 rounded-xl bg-(--bg-secondary) border border-(--card-border) w-fit overflow-x-auto">
            {tabs.filter(tab => !tab.hidden).map((tab) => (
               <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                     "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap",
                     activeTab === tab.key
                        ? "bg-(--brand-primary) text-(--heading-primary) shadow-sm"
                        : "text-(--text-tertiary) hover:bg-(--bg-accent) hover:text-(--text-secondary)",
                  ].join(" ")}
               >
                  {tab.icon}
                  {tab.label}
                  {tab.key === "bookings" && sold > 0 && (
                     <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-(--brand-primary-light) text-(--text-inverse)">
                        {sold}
                     </span>
                  )}
                  {tab.key === "reviews" && (event.totalReviews ?? 0) > 0 && (
                     <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-(--brand-primary-light) text-(--text-inverse)">
                        {event.totalReviews}
                     </span>
                  )}
               </button>
            ))}
         </div>

         {/* Tab Content Routing */}
         <div className="mt-6">
            {activeTab === "overview" && <EventOverview event={event} />}
            {activeTab === "bookings" && <EventBookingsList eventId={event.eventId} />}
            {activeTab === "checkin" && <EventCheckIn event={event} />}
            {activeTab === "reviews" && (
               <ReviewsSection 
                  eventId={event.eventId} 
                  averageRating={event.ratingAverage} 
                  totalReviews={event.totalReviews} 
               />
            )}
         </div>
      </div>
   );
}