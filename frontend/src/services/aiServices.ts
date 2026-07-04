import axiosInstance from "@/config/axios";
import type { GeneratePosterPayload, GeneratePosterResponse } from "@/types/ai.types";




export const aiServices = {
    generateEventPoster: async (payload: GeneratePosterPayload): Promise<GeneratePosterResponse> => {
        const response = await axiosInstance.post("/api/ai/generate-event-poster", payload, {
            withCredentials: true,
        });
        return response.data;
    }
};