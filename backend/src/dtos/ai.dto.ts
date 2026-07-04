// backend/src/dtos/ai.dto.ts

export interface GeneratePosterDTO {
    title: string;
    category: string;
    description: string;
    startDateTime: string;
    locationName: string;
}


export interface GeneratePosterResponseDTO {
    base64Data: string;
}