// src/components/host/OrganiserEventsSection.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { LoadingSpinner1 } from "@/components/shared/LoadingSpinner1";
import { eventServices } from "@/services/eventServices";
import OrganiserEventCard from "@/components/event/OrganiserEventCard";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import type { OrganiserEventsData } from "@/types/event.types";
import type { ApiResponse } from "@/types/common.types";
import { UserPagination } from "@/components/shared/UserPagination";



interface OrganiserEventsSectionProps {
   hostId: string;
}

const EVENTS_PER_PAGE = 6; // Standardize limit





export default function OrganiserEventsSection({ hostId }: OrganiserEventsSectionProps) {
   const navigate = useNavigate();
   
   // Data states
   const [events, setEvents] = useState<OrganiserEventsData[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   
   // Pagination states
   const [currentPage, setCurrentPage] = useState<number>(1);
   const [totalPages, setTotalPages] = useState<number>(1);
   const [totalCount, setTotalCount] = useState<number>(0);




   useEffect(() => {
      const fetchEvents = async () => {
         try {
            setLoading(true);
            const response: ApiResponse<OrganiserEventsData[]> = await eventServices.getOrganiserEvents({ 
               hostId, 
               page: currentPage, 
               limit: EVENTS_PER_PAGE 
            });
            
            setEvents(response.data);
            
            // Extract pagination from the ApiResponse wrapper
            if (response.pagination) {
               setTotalPages(response.pagination.totalPages);
               setTotalCount(response.pagination.totalCount);
            }
         } catch (error: unknown) {
            const errorMessage = getApiErrorMessage(error);
            if (errorMessage) toast.error(errorMessage);
         } finally {
            setLoading(false);
         }
      };

      fetchEvents();
   }, [hostId, currentPage]);

   const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
         setCurrentPage(newPage);
         // Optional: Scroll to top of the section when page changes
         // window.scrollTo({ top: 0, behavior: "smooth" }); 
      }
   };

   // Initial load state
   if (loading && events.length === 0) {
      return (
         <div className="h-40 flex items-center justify-center">
            <LoadingSpinner1 size="md" message="Loading portfolio..." />
         </div>
      );
   }

   return (
      <div>
         <div className="flex items-center gap-2 mb-6 border-b border-(--border-muted) pb-3">
            <Calendar size={22} className="text-(--brand-primary)" />
            <h2 className="text-xl font-bold text-(--heading-primary)">Hosted Events</h2>
            <span className="bg-(--bg-secondary) text-(--text-secondary) px-3 py-0.5 rounded-full text-lg font-bold border border-(--border-muted) ml-2">
               {totalCount}
            </span>
         </div>
            
         {events.length === 0 ? (
            <div className="text-center py-16 bg-(--bg-secondary) rounded-3xl border border-(--border-muted)">
               <Calendar size={40} className="mx-auto text-(--text-tertiary) mb-3" />
               <p className="text-(--text-secondary) font-medium">No events found for this organiser.</p>
            </div>
         ) : (
            <>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                  {/* Translucent overlay for subsequent page loads */}
                  {loading && (
                     <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl">
                        <LoadingSpinner1 size="md" />
                     </div>
                  )}
                  
                  {events.map((event) => (
                     <OrganiserEventCard 
                        key={event.eventId}
                        event={event}
                        onClick={() => navigate(`/events/${event.eventId}`)}
                     />
                  ))}
               </div>

               {/* Pagination */}
               {totalPages > 1 && (
                  <UserPagination
                     currentPage={currentPage}
                     totalPages={totalPages}
                     onPageChange={handlePageChange}
                  />
               )}
            </>
         )}
      </div>
   );
}