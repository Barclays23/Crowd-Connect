// backend/src/services/streaming-services/implementations/LiveKitStreamingService.ts
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { IStreamingService } from '../interfaces/IStreamingService';
import { HTTP_STATUS } from '@/constants/http-status.constants';
import { createHttpError } from '@/utils/httpError.utils';
import { GenerateStreamingTokenParams, JoinOnlineEventResult, LiveKitConfig } from '@/types/streaming.types';



export class LiveKitStreamingService implements IStreamingService {

    constructor(
        private readonly _config        : LiveKitConfig,
        private readonly _roomService   : RoomServiceClient
    ) {}


    async generateJoinToken(params: GenerateStreamingTokenParams): Promise<JoinOnlineEventResult> {
        try {
            const liveKitAccessToken = new AccessToken(
                this._config.apiKey, 
                this._config.apiSecret,
                {
                    identity: params.participantIdentity,
                    name: params.participantName,   // display name
                    ttl: '3h',                      // Token expires in 3 hours
                }
            );

            // Role-Based Token Grants
            liveKitAccessToken.addGrant({
                room            : params.roomName,
                roomJoin        : true,
                canSubscribe    : true,
                canPublishData  : true,
                canPublish      : params.isEventHost,
                roomAdmin       : params.isEventHost,
            });

            const streamingToken: string = await liveKitAccessToken.toJwt();
            const livekitApiUrl: string = this._config.livekitApiUrl

            return {
                streamingToken,
                serverUrl: livekitApiUrl
            };

        } catch (error: unknown) {
            console.error("LiveKit token generation error:", error);
            throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to generate video room token");
        }
    }


    // called by the startEventWorker (with BullMQ)
    async closeRoom(roomName: string): Promise<void> {
        try {
            await this._roomService.deleteRoom(roomName);

        } catch (error:unknown) {
            console.error(`Failed to close room ${roomName}:`, error);
        }
    }
}