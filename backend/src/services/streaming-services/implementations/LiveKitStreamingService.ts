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
                // canPublish      : params.isEventHost,
                canPublish      : true, // for everyone so users can turn on their own mic/cam
                roomAdmin       : params.isEventHost, // Host gets moderation controls (kick, mute audio, mute video)
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



    async muteParticipantTrack(roomName: string, identity: string, trackSid: string): Promise<void> {
        try {
            // Forces the specific track (mic or camera) to turn off
            await this._roomService.mutePublishedTrack(roomName, identity, trackSid, true);
        } catch (error: unknown) {
            console.error("Failed to mute track:", error);
            throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to mute participant");
        }
    }

    async removeParticipant(roomName: string, identity: string): Promise<void> {
        try {
            // Disconnects the user and instantly revokes their token
            await this._roomService.removeParticipant(roomName, identity);
        } catch (error: unknown) {
            console.error("Failed to remove participant:", error);
            throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to remove participant");
        }
    }
}