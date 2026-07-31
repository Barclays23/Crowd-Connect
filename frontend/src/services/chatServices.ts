// frontend/src/services/chatServices.ts
import axiosInstance from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints.constants";
import type { AskQuestionPayload, IChatResponseState } from "@/types/chat.types";
import type { ApiResponse } from "@/types/common.types";




export const chatServices = {
    askQuestion: async (payload: AskQuestionPayload): Promise<ApiResponse<IChatResponseState>> => {
        const response = await axiosInstance.post<ApiResponse<IChatResponseState>>(
            API_ENDPOINTS.CHAT.ASK,
            payload,
            { withCredentials: true }
        );
        
        return response.data;
    },
};