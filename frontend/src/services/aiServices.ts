import axiosInstance from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints.constants";
import type { GeneratePosterData, GeneratePosterPayload } from "@/types/ai.types";
import type { ApiResponse } from "@/types/common.types";




export const aiServices = {
    generateEventPoster: async (payload: GeneratePosterPayload): Promise<ApiResponse<GeneratePosterData>> => {
        const response = await axiosInstance.post<ApiResponse<GeneratePosterData>>(
            API_ENDPOINTS.AI.GENERATE_EVENT_POSTER,
            payload, 
            { withCredentials: true}
        );
        return response.data;
    }
};