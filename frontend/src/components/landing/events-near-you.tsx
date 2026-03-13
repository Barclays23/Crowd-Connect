import EventCard from "@/components/event/EventCard"
import type { IEventState } from "@/types/event.types"
import { MapPin, Users } from "lucide-react"


const nearbyEvents: IEventState[] = [
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

export function EventsNearYou() {
  return (
    <section className="py-16 bg-(--bg-primary)">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-(--heading-primary) mb-2">
              Events Near You
            </h2>
            <p className="text-(--text-secondary) flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Based on your location
            </p>
          </div>
        </div>

        {nearbyEvents.length === 0 ? (
          <p className="text-(--text-secondary) text-center">
            No events available near you.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyEvents.map((event) => (
              <div key={event.eventId} className="group">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}