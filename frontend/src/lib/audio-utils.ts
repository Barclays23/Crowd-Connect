// frontend/src/lib/audio-utils.ts

/**
 * Plays a notification sound. 
 * Ensure the audio file is placed in your public folder (e.g., public/sounds/notify.mp3)
 */
export const playNotificationSound = (): void => {
    try {
        const audio = new Audio('/sounds/notification-alert.mp3');
        
        // The promise catch handles the AbortError if the browser blocks autoplay
        audio.play().catch((error) => {
            console.warn("Autoplay policy blocked the audio playback:", error);
        });
    } catch (error) {
        console.error("Failed to play notification sound:", error);
    }
};