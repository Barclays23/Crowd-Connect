import axiosInstance from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints.constants";
import type { GeneratePosterResponse, GeneratePosterPayload } from "@/types/ai.types";
import type { ApiResponse } from "@/types/common.types";




export const aiServices = {
    generateEventPoster: async (payload: GeneratePosterPayload): Promise<ApiResponse<GeneratePosterResponse>> => {
        const response = await axiosInstance.post<ApiResponse<GeneratePosterResponse>>(
            API_ENDPOINTS.AI.GENERATE_EVENT_POSTER,
            payload, 
            { withCredentials: true}
        );
        return response.data;
    }
};