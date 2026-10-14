// frontend/src/pages/event/EventHostModerationPanel.tsx

import { Button } from "@/components/ui/button";
import { eventServices } from "@/services/eventServices";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { useLocalParticipant, useParticipants } from "@livekit/components-react";
import { Track } from "livekit-client";
import { MicOff, Settings2, UserX, VideoOff } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";





export function EventHostModerationPanel({ eventId, hostId }: { eventId: string; hostId: string }) {
    const participants = useParticipants();
    const { localParticipant } = useLocalParticipant();
    const [isOpen, setIsOpen] = useState(false);

    // Check if the current user's LiveKit identity matches the event's hostId
    if (localParticipant.identity !== hostId.toString()) return null;

    // Filter out the host so they don't accidentally kick themselves
    const attendees = participants.filter(p => p.identity !== localParticipant.identity);

    const handleMuteTrack = async (identity: string, trackSid: string, trackType: 'audio' | 'video') => {
        try {
            await eventServices.muteParticipant(eventId, { identity, trackSid });
            const successMessage = trackType === 'audio' ? "Microphone muted" : "Camera turned off";
            toast.success(`${successMessage} for participant`);
        } catch(error) {
            toast.error(getApiErrorMessage(error) || "Failed to mute participant");
        }
    }

    const handleKick = async (identity: string) => {
        try {
            await eventServices.kickParticipant(eventId, { identity });
            toast.success("Participant removed from event");
        } catch(error) {
            toast.error(getApiErrorMessage(error) || "Failed to remove participant");
        }
    }

    return (
        <div className="relative pointer-events-auto">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="bg-gray-900/80 text-white border-gray-700 hover:bg-gray-800">
                <Settings2 className="w-4 h-4 mr-2" />
                Manage Users
            </Button>
            
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3 z-50">
                    <h3 className="text-white font-semibold mb-3 border-b border-gray-700 pb-2">Attendees ({attendees.length})</h3>
                    {attendees.length === 0 ? (
                        <p className="text-gray-400 text-sm">No other users in room.</p>
                    ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                            {attendees.map(p => {
                                const audioTrack = p.getTrackPublication(Track.Source.Microphone);
                                const videoTrack = p.getTrackPublication(Track.Source.Camera);
                                // Extract the remote TrackSids assigned by LiveKit
                                
                                return (
                                    <div key={p.identity} className="flex flex-col gap-2 p-2 bg-gray-800 rounded-md">
                                        <div className="text-sm text-white font-medium truncate">{p.name || p.identity}</div>
                                        <div className="flex gap-2">
                                            {/* Mute Mic */}
                                            <Button 
                                                size="sm" 
                                                variant="secondary" 
                                                className="h-7 px-2 flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-white"
                                                disabled={!audioTrack || audioTrack.isMuted}
                                                onClick={() => audioTrack?.trackSid && handleMuteTrack(p.identity, audioTrack.trackSid, 'audio')}
                                            >
                                                <MicOff className="w-3 h-3 mr-1" />
                                                Mute
                                            </Button>
                                            
                                            {/* Disable Cam */}
                                            <Button 
                                                size="sm" 
                                                variant="secondary" 
                                                className="h-7 px-2 flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-white"
                                                disabled={!videoTrack || videoTrack.isMuted}
                                                onClick={() => videoTrack?.trackSid && handleMuteTrack(p.identity, videoTrack.trackSid, 'video')}
                                            >
                                                <VideoOff className="w-3 h-3 mr-1" />
                                                Cam Off
                                            </Button>

                                            {/* Kick */}
                                            <Button 
                                                size="sm" 
                                                variant="destructive" 
                                                className="h-7 px-2 flex-1 text-xs"
                                                onClick={() => handleKick(p.identity)}
                                            >
                                                <UserX className="w-3 h-3 mr-1" />
                                                Kick
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}