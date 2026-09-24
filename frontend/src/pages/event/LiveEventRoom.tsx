// frontend/src/pages/event/LiveEventRoom.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

import { eventServices } from '@/services/eventServices';
import { getApiErrorMessage } from '@/utils/errorMessages.utils';
import { LoadingSpinner1 } from '@/components/shared/LoadingSpinner1';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock } from 'lucide-react';
import type { ApiResponse } from '@/types/common.types';
import type { JoinOnlineEventResponse } from '@/types/streaming.types';
import type { IEventState } from '@/types/event.types';
import { isLiveStreamingRoomOpen } from '@/utils/event.utils';
import { formatCountdownTimer } from '@/utils/dateAndTime.utils';
import { ONLINE_EARLY_JOIN_BUFFER_MS } from '@/constants/checkin.constants';
import { toast } from 'react-toastify';
import { playNotificationSound } from '@/lib/audio-utils';




export default function LiveEventRoom() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    
    const [connectionData, setConnectionData] = useState<JoinOnlineEventResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Timer states
    const [event, setEvent] = useState<IEventState | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [isEarly, setIsEarly] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;

        const connectToRoom = async () => {
            if (!eventId) return;
            
            try {
                const eventRes: ApiResponse<IEventState> = await eventServices.getEventDetails(eventId);
                const eventData = eventRes.data;
                
                if (isMounted) setEvent(eventData);

                const isOpen = isLiveStreamingRoomOpen(eventData.startDateTime, eventData.endDateTime);
                if (!isOpen){
                    toast.warning(`The live room isn't open yet. Check back ${ONLINE_EARLY_JOIN_BUFFER_MS / (60 * 1000)} minutes before the start time.`, {
                        onOpen: ()=> playNotificationSound()
                    })
                };
                
                if (!isOpen) {
                    const startMs = new Date(eventData.startDateTime).getTime();
                    const joinOpenTimeMs = startMs - ONLINE_EARLY_JOIN_BUFFER_MS;
                    const nowMs = Date.now();
                    
                    // Check if it's too early vs already ended
                    if (nowMs < joinOpenTimeMs) {
                        if (isMounted) setIsEarly(true);
                        return; // Stop execution, wait for timer
                    }
                }

                // Room is open, proceed to generate connection token
                if (isMounted) setIsEarly(false);
                const response: ApiResponse<JoinOnlineEventResponse> = await eventServices.joinOnlineEvent(eventId);
                
                if (isMounted && response.data) {
                    setConnectionData(response.data);
                }
            } catch (err: unknown) {
                if (isMounted) {
                    const errorMessage = getApiErrorMessage(err) || 'Failed to join the live event.';                    
                    setError(errorMessage);
                }
            }
        };

        connectToRoom();

        return () => {
            isMounted = false;
        };
    }, [eventId]);

    // Timer effect for early access denial
    useEffect(() => {
        if (!isEarly || !event) return;

        const updateTimer = () => {
            const startMs = new Date(event.startDateTime).getTime();
            const joinOpenTimeMs = startMs - ONLINE_EARLY_JOIN_BUFFER_MS;
            const nowMs = Date.now();

            if (nowMs >= joinOpenTimeMs) {
                // Timer finished, reload to safely attempt connection & initialize WebRTC
                window.location.reload();
            } else {
                setTimeRemaining(joinOpenTimeMs - nowMs);
            }
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);
        
        return () => clearInterval(intervalId);
    }, [isEarly, event]);

    // Handle Early Access State
    if (isEarly && event) {
        return (
            <div className="flex h-screen items-center justify-center bg-(--bg-primary) p-4" data-theme="dark">
                <div className="rounded-2xl border border-(--card-border) bg-(--bg-secondary) p-8 shadow-lg text-center max-w-md w-full">
                    <Clock className="w-12 h-12 text-(--brand-primary) mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-(--heading-primary) mb-2">Room Not Open Yet</h2>
                    <p className="text-(--text-secondary) mb-6">
                        The live room opens {ONLINE_EARLY_JOIN_BUFFER_MS / (60 * 1000)} minutes before the event starts.
                    </p>
                    <div className="text-3xl font-mono font-bold text-(--brand-primary) mb-8 bg-(--bg-primary) py-4 rounded-lg border border-(--border-muted)">
                        {formatCountdownTimer(timeRemaining)}
                    </div>
                    <Button 
                        onClick={() => navigate(-1)} 
                        variant="default" 
                        className="w-full"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    // Handle Error State (e.g., no valid booking or already ended)
    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-(--bg-primary) p-4" data-theme="dark">
                <div className="rounded-2xl border border-(--card-border) bg-(--bg-secondary) p-8 shadow-lg text-center max-w-md w-full">
                    <AlertTriangle className="w-12 h-12 text-(--status-error) mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-(--heading-primary) mb-2">Access Denied</h2>
                    <p className="text-(--text-secondary) mb-6">{error}</p>
                    <Button 
                        onClick={() => navigate(-1)} 
                        variant="default" 
                        className="w-full"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    // Handle Loading State (Waiting for backend token)
    if (!connectionData) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-(--bg-primary)" data-theme="dark">
                <LoadingSpinner1 size="lg" message="Securing connection..." subMessage="Generating your access token" />
            </div>
        );
    }

    // Handle Success State (Render the WebRTC Room)
    return (
        <div className="flex h-screen w-full flex-col bg-gray-950" data-theme="dark">
            <LiveKitRoom
                video={false} // Initially start with camera off
                audio={false} // Initially start with mic off
                token={connectionData.token}
                serverUrl={connectionData.serverUrl}
                // When the user clicks the "Leave" button in the LiveKit UI, redirect them
                onDisconnected={() => navigate(`/events/${eventId}`)} 
                className="flex-1"
                data-lk-theme="default"
            >
                {/* VideoConference automatically renders the video grid, chat, and control bars */}
                <VideoConference />
                {/* RoomAudioRenderer ensures you can hear other participants */}
                <RoomAudioRenderer />
            </LiveKitRoom>
        </div>
    );
}