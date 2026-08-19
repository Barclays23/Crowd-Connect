// backend/src/utils/dateAndTime.utils.ts


// --- Constants ---
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR   = 60 * MS_PER_MINUTE;
export const MS_PER_DAY    = 24 * MS_PER_HOUR;

/**
 * Formats a millisecond duration into a human-readable string: 
 * "DD day(s) HH hours MM minutes SS seconds"
 */
export const formatTimeRemaining = (durationMs: number): string => {
    const days = Math.floor(durationMs / MS_PER_DAY);
    const hours = Math.floor((durationMs % MS_PER_DAY) / MS_PER_HOUR);
    const minutes = Math.floor((durationMs % MS_PER_HOUR) / MS_PER_MINUTE);
    const seconds = Math.floor((durationMs % MS_PER_MINUTE) / MS_PER_SECOND);

    const parts: string[] = [];
    
    if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
    // Always show seconds if it's the only unit left, or if greater than 0
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);

    return parts.join(" ");
};