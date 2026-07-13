// frontend/src/pages/event/EventDashboard.tsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LayoutList, Users, ScanLine, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";
import { eventServices } from "@/services/eventServices";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import type { IEventState } from "@/types/event.types";

import EventOverview from "@/components/event/EventOverview";
import { EventBookingsList } from "@/components/admin/event-bookings-list";
import { EventCheckIn } from "@/pages/event/EventCheckIn";
import type { ApiResponse } from "@/types/common.types";

type Tab = "overview" | "bookings" | "checkin";




export default function EventDashboard() {
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
         navigate(-1); // Go back if event not found or unauthorized

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

   const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
      { key: "overview", label: "Overview", icon: <LayoutList size={15} /> },
      { key: "bookings", label: "Bookings", icon: <Users size={15} /> },
      { key: "checkin", label: "Check-In", icon: <ScanLine size={15} /> },
   ];

   return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
         {/* Navigation Header */}
         <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} title="Go Back">
               <ArrowLeft className="h-5 w-5 text-(--text-secondary)" />
            </Button>
            <div>
               <h1 className="text-2xl font-bold tracking-tight text-(--heading-primary)">
                  {event.title}
               </h1>
               <p className="text-sm text-(--text-secondary)">Manage event details, bookings, and gate entry</p>
            </div>
         </div>

         {/* Dedicated Page Tab Bar */}
         <div className="flex gap-1 p-1 rounded-xl bg-(--bg-secondary) border border-(--card-border) w-fit">
            {tabs.map((tab) => (
               <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                     "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer",
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
               </button>
            ))}
         </div>

         {/* Tab Content Routing */}
         <div className="mt-6">
            {activeTab === "overview" && <EventOverview event={event} />}
            {activeTab === "bookings" && <EventBookingsList eventId={event.eventId} />}
            {activeTab === "checkin" && <EventCheckIn event={event} />}
         </div>
      </div>
   );
}