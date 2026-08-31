// backend/src/dtos/streaming.dto.ts

export interface JoinOnlineEventInputDTO {
    eventId: string;
    userId: string;
    userName: string;
}

export interface JoinOnlineEventResponseDTO {
    token: string;
    roomName: string;
    serverUrl: string;
}