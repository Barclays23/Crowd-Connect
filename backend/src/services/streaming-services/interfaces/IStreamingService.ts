// backend/src/services/streaming-services/interfaces/IStreamingService.ts

import { GenerateStreamingTokenParams, JoinOnlineEventResult } from "@/types/streaming.types";



export interface IStreamingService {
    generateJoinToken(params: GenerateStreamingTokenParams): Promise<JoinOnlineEventResult>;
    closeRoom(roomName: string): Promise<void>;
}