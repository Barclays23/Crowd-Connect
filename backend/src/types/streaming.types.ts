// backend/src/types/streaming.types.ts

export interface GenerateStreamingTokenParams {
    roomName: string;
    participantName: string;     // displayName
    participantIdentity: string; // Typically the User ID
    isEventHost: boolean;
}


export interface JoinOnlineEventResult {
    streamingToken: string;
    serverUrl: string;
}


export interface LiveKitConfig {
    livekitApiUrl: string;  // hostname eg:  i.e. 'https://.livekit.cloud'
    apiKey: string;
    apiSecret: string;
}