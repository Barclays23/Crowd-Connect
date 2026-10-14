// frontend/src/pages/event/LiveEventRoom.tsx
import { EventHostModerationPanel } from "@/pages/event/EventHostModerationPanel";
import { useParticipants } from "@livekit/components-react";
import { Users } from "lucide-react";





export function LiveRoomHeader({ eventId, eventTitle, hostId }: { eventId: string, eventTitle?: string, hostId: string }) {
    const participants = useParticipants();
    
    return (
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="text-white font-bold text-lg drop-shadow-md">
                {eventTitle || 'Live Event'}
            </div>
            <div className="flex items-center gap-3">
                {/* Participant Counter */}
                <div className="flex items-center gap-2 bg-gray-900/80 px-3 py-1.5 rounded-full text-white text-sm font-medium border border-gray-700 pointer-events-auto backdrop-blur-sm">
                    <Users className="w-4 h-4 text-(--brand-primary)" />
                    <span>{participants.length} {participants.length === 1 ? 'Participant' : 'Participants'}</span>
                </div>
                
                {/* Custom Moderation Panel */}
                <EventHostModerationPanel eventId={eventId} hostId={hostId} />
            </div>
        </div>
    );
}