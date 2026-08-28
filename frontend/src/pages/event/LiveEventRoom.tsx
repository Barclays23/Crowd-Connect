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
import { AlertTriangle } from 'lucide-react';
import type { ApiResponse } from '@/types/common.types';
import type { JoinOnlineEventResponse } from '@/types/streaming.types';




export default function LiveEventRoom() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    
    const [connectionData, setConnectionData] = useState<JoinOnlineEventResponse | null>(null);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        let isMounted = true;

        const connectToRoom = async () => {
            if (!eventId) return;
            
            try {
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

    // Handle Error State (e.g., trying to join too early, or no valid booking)
    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-(--bg-primary) p-4">
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
            <div className="flex h-screen flex-col items-center justify-center bg-(--bg-primary)">
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