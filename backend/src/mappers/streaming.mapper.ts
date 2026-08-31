// backend/src/mappers/streaming.mapper.ts
import { JoinOnlineEventResponseDTO } from "@/dtos/streaming.dto";



export const mapToJoinOnlineEventResponseDTO = (
    streamingToken: string, 
    roomName: string, 
    serverUrl: string
): JoinOnlineEventResponseDTO => {
    return {
        token: streamingToken,
        roomName,
        serverUrl
    };
};