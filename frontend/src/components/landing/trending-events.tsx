// frontend/src/components/landing/trending-events.tsx
import { Button } from "@/components/ui/button"
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react"
import EventCard1 from "@/components/event/EventCard1"
import type { IEventState } from "@/types/event.types"
import { useEffect, useRef, useState } from "react"
import { eventServices } from "@/services/eventServices"
import { getApiErrorMessage } from "@/utils/errorMessages.utils"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import type { ApiResponse } from "@/types/common.types"
import { useCarousel } from "@/hooks/useCarousel"





const GAP = 20



export function TrendingEvents() {
   const [trendingEvents, setTrendingEvents] = useState<IEventState[]>([])
   const [loading, setLoading] = useState<boolean>(true)
   const [error, setError] = useState<string | null>(null)
   
   const navigate = useNavigate()
   const hasFetched = useRef<boolean>(false)

   const { scrollRef, visibleCards, scrollCarousel } = useCarousel(trendingEvents.length, GAP);

   useEffect(() => {
      if (hasFetched.current) return
      hasFetched.current = true

      const fetchTrendingEvents = async () => {
         try {
         const response: ApiResponse<IEventState[]> = await eventServices.getTrendingEvents();
         setTrendingEvents(response.data)
         } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error)
         if (errorMessage) {
            setError(errorMessage)
            toast.error(errorMessage)
         }
         } finally {
         setLoading(false)
         }
      }

      fetchTrendingEvents()
   }, [])

   const cloneCount = visibleCards;
   const cards = trendingEvents.length > 0 ? [
      ...trendingEvents.slice(-cloneCount),
      ...trendingEvents,
      ...trendingEvents.slice(0, cloneCount),
   ] : []



  
   return (
      <section className="py-16 bg-(--bg-primary)">
         <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 sm:gap-0">
               <div className="flex items-center space-x-3">
                  <TrendingUp className="h-8 w-8 text-(--brand-primary) shrink-0" />
                  <div>
                     <h2 className="text-3xl font-bold text-(--heading-primary) mb-2">Trending Events</h2>
                     <p className="text-(--text-secondary)">Most popular events this week</p>
                  </div>
               </div>

               <div className="flex space-x-2 self-start sm:self-auto">
                  <Button
                     variant="outline"
                     size="icon"
                     onClick={() => scrollCarousel("left")}
                     className="border-(--border-default) text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--text-primary)"
                  >
                     <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                     variant="outline"
                     size="icon"
                     onClick={() => scrollCarousel("right")}
                     className="border-(--border-default) text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--text-primary)"
                  >
                     <ChevronRight className="h-4 w-4" />
                  </Button>
               </div>
            </div>

            {loading ? (
               <p className="text-(--text-secondary)">Loading...</p>
            ) : error ? (
               <p className="text-red-500">{error}</p>
            ) : (
               <>
                  <div
                     ref={scrollRef}
                     className="flex overflow-x-hidden py-6 px-0 scroll-smooth sm:scroll-auto"
                     style={{ gap: `${GAP}px` }}
                  >
                     {cards.map((event, index) => (
                        <div
                           key={`trending-${event.eventId}-${index}`}
                           className="shrink-0"
                           style={{ width: `calc((100% - ${GAP * (visibleCards - 1)}px) / ${visibleCards})` }}
                        >
                           <EventCard1 event={event} />
                        </div>
                     ))}
                  </div>

                  <div className="text-center mt-8">
                     <Button variant="secondary" onClick={() => navigate("/events")}>
                        View All Events
                     </Button>
                  </div>
               </>
            )}
         </div>
      </section>
   )
}