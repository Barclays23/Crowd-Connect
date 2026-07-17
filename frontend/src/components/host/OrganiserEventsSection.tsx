// src/components/host/OrganiserEventsSection.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";
import { eventServices } from "@/services/eventServices";
import OrganiserEventCard from "@/components/event/OrganiserEventCard";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import type { GetOrganiserEventsResult, OrganiserEventsData } from "@/types/event.types";
import type { ApiResponse } from "@/types/common.types";




interface OrganiserEventsSectionProps {
    hostId: string;
}


export default function OrganiserEventsSection({ hostId }: OrganiserEventsSectionProps) {
    const navigate = useNavigate();
    const [events, setEvents] = useState<OrganiserEventsData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response: ApiResponse<GetOrganiserEventsResult> = await eventServices.getOrganiserEvents({ hostId });
                setEvents(response.data.eventsData);

            } catch (error: unknown) {
                const errorMessage = getApiErrorMessage(error);
                if (errorMessage) toast.error(errorMessage);

            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [hostId]);

    if (loading) return <div className="h-40 flex items-center justify-center"><LoadingSpinner1 size="md" message="Loading portfolio..." /></div>;

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <Calendar size={22} className="text-(--brand-primary)" />
                <h2 className="text-xl font-bold text-(--heading-primary)">Event Portfolio</h2>
                <span className="bg-(--bg-secondary) text-(--text-secondary) px-2.5 py-0.5 rounded-full text-xs font-bold border border-(--border-muted)">
                    {events.length}
                </span>
            </div>
            
            {events.length === 0 ? (
                <div className="text-center py-16 bg-(--bg-secondary) rounded-3xl border border-(--border-muted)">
                    <Calendar size={40} className="mx-auto text-(--text-tertiary) mb-3" />
                    <p className="text-(--text-secondary) font-medium">No events found for this organiser.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {events.map((event) => (
                        <OrganiserEventCard 
                            key={event.eventId} 
                            event={event} 
                            onClick={() => navigate(`/events/${event.eventId}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}