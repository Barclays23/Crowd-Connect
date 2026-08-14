// frontend/src/types/ai.types.ts


export interface GeneratePosterPayload {
    title: string;
    category: string;
    description: string;
    startDateTime: string;
    locationName: string;
}


export interface GeneratePosterResponse {
    // aiPosterData: string; // The fully formatted base64 data URL
    base64Data: string; // The fully formatted base64 data URL
}