// import { EventCard } from "./event-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import concertImage from "@/assets/concert-event.jpg"
import cookingImage from "@/assets/cooking-workshop.jpg"
import sportsImage from "@/assets/sports-event.jpg"
import techImage from "@/assets/tech-conference.jpg"
import EventCard from "@/components/event/EventCard"
import type { IEventState } from "@/types/event.types"
import { useEffect, useRef } from "react"


const featuredEvents: IEventState[] = [
  {
    eventId: '699eb8c46478dbc869079350',
    organizer: {
      hostId: '6965ff22a0d2f36cb12c983f',
      hostName: 'Review User',
      organizerName: 'Brototype Update'
    },
    title: 'Wertyuio',
    category: 'Education & Workshops',
    description: 'Wertyuio ertyuiop ertyuio',
    posterUrl: 'https://res.cloudinary.com/dqphwpe5c/image/upload/v1772009668/crowd-connect/event-posters/pkoyoemu4x8yqrhffwim.png',
    format: 'offline',
    locationName: 'Kozhikode Beach',
    location: { type: 'Point', coordinates: [75.7804, 11.2588] },
    onlineLink: undefined,
    startDateTime: '2026-02-26T08:52:00.000Z',
    endDateTime: '2026-02-27T08:52:00.000Z',
    ticketType: 'paid',
    ticketPrice: 100,
    capacity: 30,
    soldTickets: 0,
    checkedInCount: 0,
    grossTicketRevenue: 0,
    eventStatus: 'suspended',
    cancellation: {
      reason: 'SUSPENDED: suspended this event 4567',
      cancelledBy: 'ADMIN',
      cancelledAt: '2026-02-25T09:22:06.666Z'
    },
    createdAt: '2026-02-25T08:54:28.255Z'
  },
  {
    eventId: '6999958f9a01824b63a646da',
    organizer: {
      hostId: '6965ff22a0d2f36cb12c983f',
      hostName: 'Review User',
      organizerName: 'Brototype Update'
    },
    title: 'Wertyuiop Changed',
    category: 'Film & Media',
    description: 'Wertyuio ertyuiop rtyuiop',
    posterUrl: 'https://res.cloudinary.com/dqphwpe5c/image/upload/v1772431381/crowd-connect/event-posters/orwvbdx8wohpef54lgqz.png',
    format: 'offline',
    locationName: 'Manoor',
    location: { type: 'Point', coordinates: [75.7804, 11.2588] },
    onlineLink: undefined,
    startDateTime: '2026-03-03T11:21:00.000Z',
    endDateTime: '2026-03-05T11:26:00.000Z',
    ticketType: 'paid',
    ticketPrice: 0.01,
    capacity: 1,
    soldTickets: 1,
    checkedInCount: 0,
    grossTicketRevenue: 0.01,
    eventStatus: 'completed',
    cancellation: undefined,
    createdAt: '2026-02-21T11:22:55.380Z'
  },
  {
    eventId: '6995f9e0da2434a989a2541c',
    organizer: {
      hostId: '6965ff22a0d2f36cb12c983f',
      hostName: 'Review User',
      organizerName: 'Brototype Update'
    },
    title: 'April Fool',
    category: 'Fashion & Beauty',
    description: 'Please update the date to publish." Please update the date to publish."',
    posterUrl: 'https://res.cloudinary.com/dqphwpe5c/image/upload/v1771436511/crowd-connect/event-posters/jfwdzbegri3gau4n1gge.avif',
    format: 'offline',
    locationName: 'Manjeri - New Bus Stand',
    location: { type: 'Point', coordinates: [75.7804, 11.2588] },
    onlineLink: undefined,
    startDateTime: '2026-02-21T04:30:00.000Z',
    endDateTime: '2026-02-22T10:30:00.000Z',
    ticketType: 'free',
    ticketPrice: 0,
    capacity: 20,
    soldTickets: 0,
    checkedInCount: 0,
    grossTicketRevenue: 0,
    eventStatus: 'suspended',
    cancellation: undefined,
    createdAt: '2026-02-18T17:41:52.476Z'
  },
  {
    eventId: '698c37c3014651cc2a1fd8fb',
    organizer: {
      hostId: '6965ff22a0d2f36cb12c983f',
      hostName: 'Review User',
      organizerName: 'Brototype Update'
    },
    title: 'New Event 2026',
    category: 'Kids & Family',
    description: "sdfghjklrtyui rtyuiop;'rtyuio",
    posterUrl: 'https://res.cloudinary.com/dqphwpe5c/image/upload/v1770796995/crowd-connect/event-posters/vyx3pkuektuelg0enakp.jpg',
    format: 'offline',
    locationName: 'Kozhikode Beach',
    location: { type: 'Point', coordinates: [75.7804, 11.2588] },
    onlineLink: undefined,
    startDateTime: '2026-02-21T08:05:00.000Z',
    endDateTime: '2026-02-22T08:02:00.000Z',
    ticketType: 'paid',
    ticketPrice: 50,
    capacity: 99,
    soldTickets: 0,
    checkedInCount: 0,
    grossTicketRevenue: 0,
    eventStatus: 'suspended',
    cancellation: {
      reason: 'SUSPENDED: suspending event 3rd time',
      cancelledBy: 'ADMIN',
      cancelledAt: '2026-02-19T16:12:46.771Z'
    },
    createdAt: '2026-02-11T08:03:15.736Z'
  },

  {
    eventId: '698b2a6e7937407b9a9961c4',
    organizer: {
      hostId: '6965ff22a0d2f36cb12c983f',
      hostName: 'Review User',
      organizerName: 'Brototype Update'
    },
    title: 'ABDCIUYT',
    category: 'Weddings & Social Gatherings',
    description: 'another event is going',
    posterUrl: 'https://res.cloudinary.com/dqphwpe5c/image/upload/v1770728045/crowd-connect/event-posters/z4uyovmsumgz3duidgp2.jpg',
    format: 'offline',
    locationName: 'Manoor - Chekanoor Road',
    location: { type: 'Point', coordinates: [75.7804, 11.2588] },
    onlineLink: undefined,
    startDateTime: '2026-03-23T12:53:00.000Z',
    endDateTime: '2026-04-23T12:56:00.000Z',
    ticketType: 'free',
    ticketPrice: 0,
    capacity: 7,
    soldTickets: 1,
    checkedInCount: 0,
    grossTicketRevenue: 0,
    eventStatus: 'upcoming',
    cancellation: undefined,
    createdAt: '2026-02-10T12:54:06.365Z'
  },
  {
    eventId: '698ae9cf1cbfd8672df252d0',
    organizer: {
      hostId: '6953c1b1e1e167fd8026dec5',
      hostName: 'werty',
      organizerName: 'Thanal Club'
    },
    title: 'Test Event',
    category: 'Art & Exhibitions',
    description: 'for virtual UI display based on startDateTime & endDateTime',
    posterUrl: 'https://res.cloudinary.com/dqphwpe5c/image/upload/v1770711503/crowd-connect/event-posters/wc3idl6foiwi1tt3jyt0.jpg',
    format: 'offline',
    locationName: 'Othukkungal Panchayath Office',
    location: { type: 'Point', coordinates: [75.7804, 11.2588] },
    onlineLink: undefined,
    startDateTime: '2026-02-10T08:19:00.000Z',
    endDateTime: '2026-02-10T08:20:00.000Z',
    ticketType: 'free',
    ticketPrice: 0,
    capacity: 10,
    soldTickets: 0,
    checkedInCount: 0,
    grossTicketRevenue: 0,
    eventStatus: 'draft',
    cancellation: undefined,
    createdAt: '2026-02-10T08:18:23.377Z'
  }
]



const VISIBLE_CARDS = 4
const GAP = 24 // gap-6

export function FeaturedEvents() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)

  // Clone last N and first N cards for infinite feel
  const cloneCount = VISIBLE_CARDS
  const cards = [
    ...featuredEvents.slice(-cloneCount),  // clones at start
    ...featuredEvents,                      // real cards
    ...featuredEvents.slice(0, cloneCount), // clones at end
  ]

  const getCardWidth = () => {
    if (!scrollRef.current) return 0
    const containerWidth = scrollRef.current.offsetWidth
    return (containerWidth - GAP * (VISIBLE_CARDS - 1)) / VISIBLE_CARDS
  }

  const getScrollPerCard = () => getCardWidth() + GAP

  // On mount, jump silently to offset so clones at start are hidden
  useEffect(() => {
    if (!scrollRef.current) return
    const offset = getScrollPerCard() * cloneCount
    scrollRef.current.scrollLeft = offset
  }, [])

  const scrollCarousel = (direction: "left" | "right") => {
    if (!scrollRef.current || isScrollingRef.current) return
    isScrollingRef.current = true

    const step = getScrollPerCard()
    const current = scrollRef.current.scrollLeft
    const target = direction === "left" ? current - step : current + step

    scrollRef.current.scrollTo({ left: target, behavior: "smooth" })

    // After smooth scroll, check if we've hit a clone zone and silently jump
    setTimeout(() => {
      if (!scrollRef.current) return

      const el = scrollRef.current
      const realStart = step * cloneCount
      const realEnd = step * (cloneCount + featuredEvents.length)

      if (el.scrollLeft < step * 1) {
        // Hit start clone zone — jump to real end equivalent
        el.scrollLeft = el.scrollLeft + step * featuredEvents.length
      } else if (el.scrollLeft >= realEnd - step * 0.5) {
        // Hit end clone zone — jump to real start equivalent
        el.scrollLeft = el.scrollLeft - step * featuredEvents.length
      }

      isScrollingRef.current = false
    }, 350) // slightly longer than smooth scroll duration (~300ms)
  }

  return (
    <section className="py-16 bg-(--bg-primary)">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-(--heading-primary) mb-2">Featured Events</h2>
            <p className="text-(--text-secondary)">Discover the most popular events happening now</p>
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

        <div
          ref={scrollRef}
          className="flex overflow-x-hidden"
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
          <Button
            variant="outline"
            className="bg-(--btn-secondary-bg) hover:bg-(--btn-secondary-hover) text-(--btn-secondary-text) border-(--border-default)"
          >
            View All Featured Events
          </Button>
        </div>
      </div>
    </section>
  )
}