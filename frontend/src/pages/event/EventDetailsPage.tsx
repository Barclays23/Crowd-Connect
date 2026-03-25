// frontend/src/pages/EventDetailsPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    Calendar, MapPin, Users, Tag, Wifi, Clock, ChevronLeft,
    Share2, Heart, Ticket, AlertCircle, CheckCircle,
    Info, CalendarX
} from "lucide-react";
import { eventServices } from "@/services/eventServices";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { toast } from "react-toastify";
import { EVENT_FORMATS, EVENT_STATUSES, TICKET_TYPES, type IEventState } from "@/types/event.types";
import { BookingModal } from "@/components/booking/BookingModal";
import { useAuth } from "@/contexts/AuthContext";
import { capitalize } from "@/utils/namingConventions";
import type { UserState } from "@/types/user.types";
import { getSeatsInfo, getEventStatusBadgeVariant, getEventCategoryBadgeVariant } from "@/utils/UI.utils";
import { formatDate4 } from "@/utils/dateAndTimeFormats";
import { EventMap } from "@/components/common/EventMap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";




function EventDetailsPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [event, setEvent] = useState<IEventState | null>(null);
    const [loading, setLoading] = useState(true);
    const [wishlisted, setWishlisted] = useState(false);
    const [bookingOpen, setBookingOpen] = useState(false);
    
    const { user }: { user: UserState | null } = useAuth();

    useEffect(() => {
        if (!eventId) return;

        (async () => {
            try {
                setLoading(true);
                const response = await eventServices.getEventDetails(eventId);
                setEvent(response.eventDetails ?? response);
            } catch (error: unknown) {
                const errorMessage = getApiErrorMessage(error);
                if (errorMessage) toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        })();
    }, [eventId]);


    // Auto-open booking modal after login redirect
    useEffect(() => {
        const state = location.state as { openBooking?: boolean } | null;
        if (state?.openBooking && user && event) {
            setBookingOpen(true);
            navigate(location.pathname + location.search, { 
                replace: true, 
                state: {} 
            });
        }
    }, [user, event, location.state, navigate, location.pathname, location.search]);


    const handleShare = async () => {
        try {
            await navigator.share({ title: event?.title, url: window.location.href });
        } catch {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        }
    };

    const handleBookClick = () => {
        if (!user) {
            toast.info("Please log in to book this event.");
            navigate("/login", { 
            state: { 
                    from: location,
                    openBooking: true // Optional flag to auto-open booking modal after login
                } 
            });
            return;
        }
        setBookingOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-(--bg-primary) flex items-center justify-center">
                <LoadingSpinner1 
                    message="Loading event..." 
                    subMessage="Fetching event details"
                    size="lg"
                />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-(--bg-primary) flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center px-6">
                    <CalendarX size={48} className="text-(--text-tertiary)" />
                    <h2 className="text-xl font-bold text-(--heading-primary)">Event not found</h2>
                    <p className="text-(--text-secondary) text-sm">This event may have been removed or doesn't exist.</p>
                    <Button
                        onClick={() => navigate("/events")}
                        variant="default"
                        size="lg"
                        className="mt-2"
                    >
                        Browse Events
                    </Button>
                </div>
            </div>
        );
    }

    const seats = getSeatsInfo(event);
    const isFree = event.ticketType === TICKET_TYPES.FREE;
    const isOnline = event.format === EVENT_FORMATS.ONLINE;
    const isCancelled = event.eventStatus === EVENT_STATUSES.CANCELLED || event.eventStatus === EVENT_STATUSES.SUSPENDED;
    const isEnded = new Date(event.endDateTime).getTime() < Date.now();
    const canBook = !isCancelled && !isEnded;

    const coords = event.location?.coordinates;
    const lat = coords ? coords[1] : null;
    const lng = coords ? coords[0] : null;

    const statusBadgeVariant = getEventStatusBadgeVariant(event.eventStatus);
    const categoryBadgeVariant = getEventCategoryBadgeVariant(event.category);


    return (
        <div className="min-h-screen bg-(--bg-primary) text-(--text-primary)">

            {/* ── Back nav ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
                <Button
                    onClick={() => navigate('/events')}
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    Back to Events
                </Button>
            </div>

            {/* ── Hero Image ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
                <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 bg-(--bg-tertiary)">
                    {event.posterUrl ? (
                        <img
                            src={event.posterUrl}
                            alt={event.title}
                            className={`w-full h-full object-cover ${isEnded || isCancelled ? "grayscale opacity-60" : ""}`}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-(--text-tertiary)">
                            <Calendar size={48} className="opacity-20" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute top-5 left-5 flex items-center gap-2">
                        {event.eventStatus === EVENT_STATUSES.ONGOING && (
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--badge-success-text) opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-(--badge-success-text)" />
                            </span>
                        )}
                        <Badge variant={statusBadgeVariant} size="md" className="backdrop-blur-sm uppercase tracking-wider">
                            {capitalize(event.eventStatus)}
                        </Badge>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-5 right-5 flex gap-2">
                        <Button
                            onClick={() => setWishlisted(!wishlisted)}
                            variant="ghost"
                            size="icon"
                            className="bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-black/60 text-white"
                        >
                            <Heart
                                size={18}
                                style={{
                                    color: wishlisted ? "var(--status-error)" : "white",
                                    fill: wishlisted ? "var(--status-error)" : "none",
                                }}
                            />
                        </Button>
                        <Button
                            onClick={handleShare}
                            variant="ghost"
                            size="icon"
                            className="bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-black/60 text-white"
                        >
                            <Share2 size={18} />
                        </Button>
                    </div>

                    {/* Bottom info overlay */}
                    <div className="absolute bottom-5 left-5 right-5">
                        <div className="flex flex-wrap gap-2 mb-3">
                            <Badge
                                variant={isFree ? "success" : "primary"}
                                size="md"
                                className="backdrop-blur-sm"
                            >
                                {isFree ? "Free Entry" : `₹${event.ticketPrice?.toLocaleString("en-IN")} / ticket`}
                            </Badge>
                            <Badge
                                variant={isOnline ? "info" : "secondary"}
                                size="md"
                                className="flex items-center gap-1 backdrop-blur-sm"
                            >
                                {isOnline ? <Wifi size={11} /> : <MapPin size={11} />}
                                {isOnline ? "Online Event" : "In-Person"}
                            </Badge>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-lg">
                            {event.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── Left: Details ── */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Organiser + Category */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-(--bg-tertiary) border border-(--card-border) flex items-center justify-center text-(--text-tertiary)">
                                <Users size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-(--text-tertiary) uppercase tracking-wider">Organised by</p>
                                <p className="text-sm font-semibold text-(--heading-primary)">{event.organizer?.organizerName}</p>
                            </div>
                            <div className="ml-auto">
                                <Badge variant={categoryBadgeVariant} size="md" className="gap-1.5">
                                    <Tag size={12} />
                                    {event.category}
                                </Badge>
                            </div>
                        </div>

                        <div className="h-px bg-(--border-muted)" />

                        {/* Date & Time */}
                        <div>
                            <h2 className="text-lg font-bold text-(--heading-primary) mb-4 flex items-center gap-2">
                                <Calendar size={20} className="text-(--brand-primary)" />
                                Date & Time
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-(--bg-secondary) border border-(--card-border) rounded-2xl p-4">
                                    <p className="text-xs text-(--text-tertiary) uppercase tracking-wider mb-1">Starts</p>
                                    <p className="text-sm font-semibold text-(--heading-primary)">{formatDate4(event.startDateTime)}</p>
                                </div>
                                <div className="bg-(--bg-secondary) border border-(--card-border) rounded-2xl p-4">
                                    <p className="text-xs text-(--text-tertiary) uppercase tracking-wider mb-1">Ends</p>
                                    <p className="text-sm font-semibold text-(--heading-primary)">{formatDate4(event.endDateTime)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Location / How to Join */}
                        <div>
                            <h2 className="text-lg font-bold text-(--heading-primary) mb-4 flex items-center gap-2">
                                <MapPin size={20} className="text-(--brand-primary)" />
                                {isOnline ? "How to Join" : "Location"}
                            </h2>
                            {isOnline ? (
                                <div className="bg-(--badge-info-bg) border border-(--badge-info-border) rounded-2xl p-5 flex items-start gap-4">
                                    <Wifi size={22} className="text-(--badge-info-text) shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-(--heading-primary) mb-1">Virtual Event</p>
                                        <p className="text-sm text-(--text-secondary)">
                                            This is an online event. A join link will be provided after booking and QR validation.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 bg-(--bg-secondary) border border-(--card-border) rounded-2xl p-4">
                                        <MapPin size={18} className="text-(--brand-primary) shrink-0 mt-0.5" />
                                        <p className="text-sm text-(--text-primary) font-medium">{event.locationName || "Location to be announced"}</p>
                                    </div>
                                    {lat && lng && (
                                        <EventMap
                                            lat={lat}
                                            lng={lng}
                                            locationName={event.locationName}
                                            interactive={true}
                                            height={280}
                                            showExternalLink={true}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {event.description && (
                            <div>
                                <h2 className="text-lg font-bold text-(--heading-primary) mb-4 flex items-center gap-2">
                                    <Info size={20} className="text-(--brand-primary)" />
                                    About this Event
                                </h2>
                                <div className="bg-(--bg-secondary) border border-(--card-border) rounded-2xl p-6">
                                    <p className="text-sm text-(--text-secondary) leading-relaxed whitespace-pre-line">
                                        {event.description}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right: Booking Card ── */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20">
                            <div className="bg-(--card-bg) border border-(--card-border) rounded-3xl overflow-hidden shadow-lg">

                                {/* Price header */}
                                <div className="p-6 border-b border-(--card-border) bg-(--bg-secondary)">
                                    <p className="text-xs text-(--text-tertiary) uppercase tracking-wider mb-1">Ticket Price</p>
                                    <p className="text-3xl font-extrabold text-(--heading-primary)">
                                        {isFree ? (
                                            <span className="text-(--status-success)">Free</span>
                                        ) : (
                                            <>₹<span>{event.ticketPrice?.toLocaleString("en-IN")}</span>
                                                <span className="text-base font-normal text-(--text-tertiary)"> / person</span></>
                                        )}
                                    </p>
                                </div>

                                {/* Availability bar */}
                                {seats && (
                                    <div className="px-6 pt-5 pb-2">
                                        <div className="flex justify-between items-center mb-2 text-sm">
                                            <span className="font-medium text-(--text-primary)">Availability</span>
                                            <span className={`font-bold ${seats.remaining <= 0 ? "text-(--status-error)"
                                                    : seats.remaining <= 10 ? "text-(--badge-warning-text)"
                                                        : "text-(--status-success)"}`}
                                            >
                                                {seats.remaining <= 0 ? "Sold Out" : `${seats.remaining} left`}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-(--bg-tertiary) overflow-hidden mb-1">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${seats.remaining <= 0 ? "bg-(--status-error)"
                                                        : seats.remaining <= 10 ? "bg-(--badge-warning-text)"
                                                            : "bg-(--brand-primary)"}`}
                                                style={{ width: `${seats.percentage}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-(--text-tertiary)">{seats.sold} of {seats.capacity} tickets sold</p>
                                    </div>
                                )}

                                {/* Cancelled / ended alert */}
                                {(isCancelled || isEnded) && (
                                    <div className="mx-4 mt-4 flex items-start gap-3 bg-(--badge-error-bg) border border-(--badge-error-border) rounded-xl p-4">
                                        <AlertCircle size={18} className="text-(--badge-error-text) shrink-0 mt-0.5" />
                                        <p className="text-sm text-(--badge-error-text) font-medium">
                                            {isCancelled ? "This event has been cancelled." : "This event has already ended."}
                                        </p>
                                    </div>
                                )}

                                {/* Book button */}
                                <div className="p-6 pt-4 space-y-3">
                                    {canBook && seats && seats.remaining <= 0 ? (
                                        <Button
                                            disabled
                                            variant="secondary"
                                            size="lg"
                                            className="w-full opacity-60 cursor-not-allowed"
                                        >
                                            Sold Out
                                        </Button>
                                    ) : canBook ? (
                                        <Button
                                            onClick={handleBookClick}
                                            variant="default"
                                            size="lg"
                                            className="w-full gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                                        >
                                            <Ticket size={20} />
                                            {isFree ? "Book Your Tickets" : "Book Tickets"}
                                        </Button>
                                    ) : null}

                                    <Button
                                        onClick={() => setWishlisted(!wishlisted)}
                                        variant="secondary"
                                        size="lg"
                                        className="w-full gap-2"
                                    >
                                        <Heart
                                            size={16}
                                            style={{
                                                color: wishlisted ? "var(--status-error)" : "currentColor",
                                                fill: wishlisted ? "var(--status-error)" : "none",
                                            }}
                                        />
                                        {wishlisted ? "Saved to Favourites" : "Save to Favourites"}
                                    </Button>
                                </div>

                                {/* Quick info */}
                                <div className="px-6 pb-6 space-y-2.5 border-t border-(--card-border) pt-4">
                                    <div className="flex items-center gap-2.5 text-sm text-(--text-secondary)">
                                        <CheckCircle size={15} className="text-(--status-success)" />
                                        <span>Instant confirmation via email</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-sm text-(--text-secondary)">
                                        <CheckCircle size={15} className="text-(--status-success)" />
                                        <span>QR code sent after booking</span>
                                    </div>
                                    {!isFree && (
                                        <div className="flex items-center gap-2.5 text-sm text-(--text-secondary)">
                                            <CheckCircle size={15} className="text-(--status-success)" />
                                            <span>Refund available up to 48h before</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2.5 text-sm text-(--text-secondary)">
                                        <Clock size={15} className="text-(--brand-primary)" />
                                        <span>Starts {formatDate4(event.startDateTime, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", weekday: undefined, year: undefined })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Share button */}
                            <Button
                                onClick={handleShare}
                                variant="outline"
                                size="lg"
                                className="mt-3 w-full gap-2"
                            >
                                <Share2 size={15} />
                                Share Event
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {user && (
                <BookingModal
                    isOpen={bookingOpen}
                    onClose={() => setBookingOpen(false)}
                    event={event}
                    user={user}
                    onBooked={(booking) => {
                        setEvent((prev) =>
                            prev ? { ...prev, soldTickets: (prev.soldTickets ?? 0) + booking.quantity } : prev
                        );
                    }}
                />
            )}
        </div>
    );
}

export default EventDetailsPage;