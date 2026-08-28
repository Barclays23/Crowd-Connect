// frontend/src/utils/event.utils.ts

import { ONLINE_EARLY_JOIN_BUFFER_MS } from "@/constants/checkin.constants";

/**
 * Checks if the live streaming room is currently open.
 * Opens 15 minutes before the start time and closes at the end time.
 */
export function isLiveStreamingRoomOpen(startDateTime: string | Date, endDateTime: string | Date): boolean {
    const nowMs = Date.now();
    const startMs = new Date(startDateTime).getTime();
    const endMs = new Date(endDateTime).getTime();
    
    // 15 minutes = 15 * 60 * 1000 milliseconds (check ONLINE_EARLY_JOIN_BUFFER_MS)
    const joinOpenTimeMs = startMs - ONLINE_EARLY_JOIN_BUFFER_MS;

    return nowMs >= joinOpenTimeMs && nowMs <= endMs;
}