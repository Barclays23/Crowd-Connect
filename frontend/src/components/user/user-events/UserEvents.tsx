// frontend/src/components/user/user-events/UserEvents.tsx
import { useState, useEffect, useCallback } from "react";
import { eventServices } from "@/services/eventServices";
import { toast } from "react-toastify";
import { UserPagination } from "@/components/shared/UserPagination";
import { Modal } from "@/components/ui/modal";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import EditEventForm from "@/components/host/EditEventForm";
import { buildEventFormData } from "@/utils/payload-utils/eventPayload.utils";
import { EventCheckIn } from "@/components/checkin/EventCheckIn";
import type { ApiResponse } from "@/types/common.types";
import {
   type EventSortDirection,
   type EventSortField,
   type IEventState,
   type UpdateEventStatusPayload,
} from "@/types/event.types";
import { type EventFormValues } from "@/schemas/event.schema";

// Import Refactored Components
import { UserEventActions } from "./UserEventActions";
import { UserEventsFilters } from "./UserEventsFilters";
import { UserEventsMobileList } from "./UserEventsMobileList";
import { UserEventsDesktopTable } from "./UserEventsDesktopTable";
import { CancelEventModal } from "./CancelEventModal";

export default function UserEvents() {
   const [searchTerm, setSearchTerm] = useState("");
   const [statusFilter, setStatusFilter] = useState("all");
   const [categoryFilter, setCategoryFilter] = useState("all");

   const [sortBy, setSortBy] = useState<EventSortField>("createdAt");
   const [sortOrder, setSortOrder] = useState<EventSortDirection>("desc");

   const [events, setEvents] = useState<IEventState[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const [editEvent, setEditEvent] = useState<IEventState | null>(null);
   const [editModalOpen, setEditModalOpen] = useState(false);

   const [publishModalOpen, setPublishModalOpen] = useState(false);
   const [eventToPublish, setEventToPublish] = useState<string | null>(null);
   const [isPublishing, setIsPublishing] = useState(false);

   const [cancelModalOpen, setCancelModalOpen] = useState(false);
   const [eventToCancel, setEventToCancel] = useState<string | null>(null);
   const [cancelReason, setCancelReason] = useState("");
   const [isCancelling, setIsCancelling] = useState(false);

   const [checkInEvent, setCheckInEvent] = useState<IEventState | null>(null);

   const itemsPerPage = 10;
   const [currentPage, setCurrentPage] = useState(1);
   const [totalEvents, setTotalEvents] = useState(0);
   const [totalPages, setTotalPages] = useState(1);

   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

   const handleEditEventSubmit = async (data: EventFormValues) => {
      if (!editEvent) return;

      const formData: FormData = buildEventFormData(data);

      try {
         const response: ApiResponse<IEventState> = await eventServices.updateEventByHost({eventId: editEvent.eventId, formData});
         toast.success(response.message);
         setEditModalOpen(false);
         setEditEvent(null);
         fetchMyEvents();
      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);
      }
   };

   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedSearchTerm(searchTerm);
         setCurrentPage(1);
      }, 600);
      return () => clearTimeout(timer);
   }, [searchTerm]);

   const fetchMyEvents = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
         const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: itemsPerPage.toString(),
            sortBy,
            sortOrder,
            ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
            ...(statusFilter !== "all" && { status: statusFilter }),
            ...(categoryFilter !== "all" && { category: categoryFilter }),
         });

         const response: ApiResponse<IEventState[]> = await eventServices.getMyEvents(params.toString());

         setEvents(response.data ?? []);
         setTotalEvents(response.pagination?.totalCount ?? 0);
         setTotalPages(response.pagination?.totalPages ?? Math.ceil((response.pagination?.totalCount ?? 0) / itemsPerPage));

      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);
         setError(errorMessage);
      } finally {
         setLoading(false);
      }
   }, [currentPage, debouncedSearchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

   useEffect(() => {
      fetchMyEvents();
   }, [fetchMyEvents]);

   const handleSort = (field: EventSortField) => {
      if (sortBy === field) {
         setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
         setSortBy(field);
         setSortOrder("asc");
      }
      setCurrentPage(1);
   };

   const requestPublish = (eventId: string) => {
      setEventToPublish(eventId);
      setPublishModalOpen(true);
   };

   const confirmPublish = async () => {
      if (!eventToPublish) return;
      try {
         setIsPublishing(true);
         const response: ApiResponse<void> = await eventServices.publishEvent(eventToPublish);
         toast.success(response.message);
         fetchMyEvents();
      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);
      } finally {
         setPublishModalOpen(false);
         setEventToPublish(null);
         setIsPublishing(false);
      }
   };

   const requestCancel = (eventId: string) => {
      setEventToCancel(eventId);
      setCancelReason("");
      setCancelModalOpen(true);
   };

   const confirmCancel = async () => {
      if (!eventToCancel || !cancelReason.trim()) return;
      try {
         setIsCancelling(true);
         const response: ApiResponse<UpdateEventStatusPayload> = await eventServices.cancelEvent(eventToCancel, cancelReason);
         toast.success(response.message);
         fetchMyEvents();
      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);
      } finally {
         setCancelModalOpen(false);
         setEventToCancel(null);
         setIsCancelling(false);
      }
   };

   const renderActions = (event: IEventState, compact: boolean) => (
      <UserEventActions
         event={event}
         compact={compact}
         onEdit={(e) => { setEditEvent(e); setEditModalOpen(true); }}
         onPublish={requestPublish}
         onCancel={requestCancel}
         onCheckIn={setCheckInEvent}
      />
   );


   
   return (
      <div className="space-y-4 sm:space-y-6">
         {/* Header Section */}
         <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
            <div>
               <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-(--heading-primary)">Hosted Events ({totalEvents})</h2>
               <p className="text-(--text-secondary) mt-1 sm:mt-1.5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  <span>Manage and track your hosted events</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-(--border-strong)"></span>
                  <span className="font-semibold text-(--brand-primary)">{totalEvents} Total</span>
               </p>
            </div>
         </div>

         <UserEventsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            setCurrentPage={setCurrentPage}
         />

         <UserEventsMobileList
            events={events}
            loading={loading}
            error={error}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            renderActions={renderActions}
         />

         <UserEventsDesktopTable
            events={events}
            loading={loading}
            error={error}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            renderActions={renderActions}
         />

         {/* Pagination */}
         {!loading && events.length > 0 && (
            <div className="pt-2">
               <UserPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
               />
            </div>
         )}

         {/* Modals */}
         <Modal isOpen={editModalOpen} onClose={() => { setEditModalOpen(false); setEditEvent(null); }} title={`Edit Event : ${editEvent?.title}`} size="lg">
            {editEvent && (
               <EditEventForm key={editEvent.eventId} editEvent={editEvent} onSubmit={handleEditEventSubmit} onCancel={() => { setEditModalOpen(false); setEditEvent(null); }} />
            )}
         </Modal>

         <ConfirmationModal isOpen={publishModalOpen} onClose={() => { setPublishModalOpen(false); setEventToPublish(null); }} onConfirm={confirmPublish} title="Publish Event" description="Once published, the event will be visible to everyone and users can start registering/booking tickets." confirmText="Publish Now" cancelText="Cancel" variant="default" loading={isPublishing} />

         <CancelEventModal
            isOpen={cancelModalOpen}
            isCancelling={isCancelling}
            cancelReason={cancelReason}
            onReasonChange={setCancelReason}
            onClose={() => { if (!isCancelling) { setCancelModalOpen(false); setEventToCancel(null); } }}
            onConfirm={confirmCancel}
         />

         <Modal isOpen={!!checkInEvent} onClose={() => setCheckInEvent(null)} title={`Check-In : ${checkInEvent?.title}`} size="lg">
            {checkInEvent && <EventCheckIn event={checkInEvent} />}
         </Modal>
      </div>
   );
}