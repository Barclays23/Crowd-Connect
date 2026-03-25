import { Button } from "@/components/ui/button"
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react"
import EventCard from "@/components/event/EventCard"
import type { IEventState } from "@/types/event.types"
import { useEffect, useRef, useState } from "react"
import { eventServices } from "@/services/eventServices"
import { getApiErrorMessage } from "@/utils/errorMessages.utils"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

const VISIBLE_CARDS = 4
const GAP = 20

export function TrendingEvents() {
  const [trendingEvents, setTrendingEvents] = useState<IEventState[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    const fetchTrendingEvents = async () => {
      try {
        const data = await eventServices.trendingEvents()
        setTrendingEvents(data.trendingEvents)
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

  const cloneCount = VISIBLE_CARDS
  const cards = trendingEvents.length > 0 ? [
    ...trendingEvents.slice(-cloneCount),
    ...trendingEvents,
    ...trendingEvents.slice(0, cloneCount),
  ] : []

  const getCardWidth = () => {
    if (!scrollRef.current) return 0
    return (scrollRef.current.offsetWidth - GAP * (VISIBLE_CARDS - 1)) / VISIBLE_CARDS
  }

  const getScrollPerCard = () => getCardWidth() + GAP

  useEffect(() => {
    if (!scrollRef.current || trendingEvents.length === 0) return
    scrollRef.current.scrollLeft = getScrollPerCard() * cloneCount
  }, [trendingEvents])

  const scrollCarousel = (direction: "left" | "right") => {
    if (!scrollRef.current || isScrollingRef.current) return
    isScrollingRef.current = true

    const step = getScrollPerCard()
    const current = scrollRef.current.scrollLeft
    const target = direction === "left" ? current - step : current + step

    scrollRef.current.scrollTo({ left: target, behavior: "smooth" })

    setTimeout(() => {
      if (!scrollRef.current) return
      const el = scrollRef.current
      const realEnd = step * (cloneCount + trendingEvents.length)

      if (el.scrollLeft < step * 1) {
        el.scrollLeft = el.scrollLeft + step * trendingEvents.length
      } else if (el.scrollLeft >= realEnd - step * 0.5) {
        el.scrollLeft = el.scrollLeft - step * trendingEvents.length
      }

      isScrollingRef.current = false
    }, 350)
  }

  return (
    <section className="py-16 bg-(--bg-primary)">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-(--brand-primary)" />
            <div>
              <h2 className="text-3xl font-bold text-(--heading-primary) mb-2">Trending Events</h2>
              <p className="text-(--text-secondary)">Most popular events this week</p>
            </div>
          </div>

          <div className="flex space-x-2">
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
              className="flex overflow-x-hidden py-6 px-0"
              style={{ gap: `${GAP}px` }}
            >
              {cards.map((event, index) => (
                <div
                  key={index}
                  className="shrink-0"
                  style={{ width: `calc((100% - ${GAP * (VISIBLE_CARDS - 1)}px) / ${VISIBLE_CARDS})` }}
                >
                  <EventCard event={event} />
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