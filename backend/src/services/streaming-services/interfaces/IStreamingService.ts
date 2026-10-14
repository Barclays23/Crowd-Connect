// backend/src/services/streaming-services/interfaces/IStreamingService.ts

import { GenerateStreamingTokenParams, JoinOnlineEventResult } from "@/types/streaming.types";



export interface IStreamingService {
    generateJoinToken(params: GenerateStreamingTokenParams): Promise<JoinOnlineEventResult>;
    closeRoom(roomName: string): Promise<void>;
    muteParticipantTrack(roomName: string, identity: string, trackSid: string): Promise<void>
    removeParticipant(roomName: string, identity: string): Promise<void>
}