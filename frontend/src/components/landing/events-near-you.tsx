import EventCard from "@/components/event/EventCard"
import { DEFAULT_RADIUS_KM, type IEventState } from "@/types/event.types"
import { MapPin, Loader2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { eventServices } from "@/services/eventServices"
import { getApiErrorMessage } from "@/utils/errorMessages.utils"
import { Button } from "@/components/ui/button"
import { useReverseGeocode } from "@/hooks/useReverseGeocode"
import { EVENT_FORMATS } from "@/constants/event.constants"


export function EventsNearYou() {
  const [nearbyEvents, setNearbyEvents] = useState<IEventState[]>([])
  const [loading, setLoading] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationName, setLocationName] = useState<string | null>(null)

  const hasFetched = useRef(false)
  const { reverseGeocode, isGeocodingLoaded } = useReverseGeocode()



  const fetchNearbyEvents = (lat: number, lng: number) => {
    const query = new URLSearchParams({
      format: EVENT_FORMATS.OFFLINE,
      lat: lat.toString(),
      lng: lng.toString(),
      radiusKm: DEFAULT_RADIUS_KM.toString(),
      limit: "6",
    }).toString()

    eventServices
      .getPublicEvents(query)
      .then((data) => setNearbyEvents(data.eventsData ?? []))
      .catch((err) => setLocationError(getApiErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  const requestLocation = useCallback(() => {
    setLoading(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const name = await reverseGeocode(latitude, longitude)
        setLocationName(name)
        fetchNearbyEvents(latitude, longitude)
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Please allow location access to see nearby events.")
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.")
            break
          case error.TIMEOUT:
            setLocationError("Location request timed out.")
            break
          default:
            setLocationError("An unknown error occurred.")
        }
        setLoading(false)
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 } // cache location for 5 mins
    )
  }, [reverseGeocode])


  useEffect(() => {
    if (!isGeocodingLoaded || hasFetched.current) return;

    hasFetched.current = true

    requestLocation()
  }, [requestLocation, isGeocodingLoaded]);




  return (
    <section className="py-16 bg-(--bg-primary)">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-(--heading-primary) mb-2">
              Events Near You
            </h2>

            <p className="text-(--text-secondary) flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 shrink-0 text-(--brand-primary)" />
              {locationName ? (
                <span>
                  Within <strong className="font-medium text-(--text-primary)">{DEFAULT_RADIUS_KM} km</strong> of <strong className="font-medium text-(--text-primary)">{locationName}</strong>
                </span>
              ) : (
                "Based on your location"
              )}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 text-(--text-secondary) py-12">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Fetching your location...</span>
          </div>
        ) : locationError ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-(--text-secondary)">{locationError}</p>
            <Button variant="secondary" onClick={requestLocation}>
              Try Again
            </Button>
          </div>
        ) : nearbyEvents.length === 0 ? (
          <p className="text-(--text-secondary) text-center py-12">
            No events found within {DEFAULT_RADIUS_KM}km of your location.
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