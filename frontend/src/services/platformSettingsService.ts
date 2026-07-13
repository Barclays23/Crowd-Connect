// frontend/src/services/platformSettingsService.ts
import axiosInstance from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints.constants";
import type { ApiResponse } from "@/types/common.types";
import type { IPlatformSettings } from "@/types/platformSettings.types";





export const platformSettingsService = {

    getSettings: async (): Promise<ApiResponse<IPlatformSettings>> => {
        const response = await axiosInstance.get<ApiResponse<IPlatformSettings>>(
            API_ENDPOINTS.SETTINGS.BASE,
            { withCredentials: true }
        );
        return response.data;
    },

    updateSettings: async (updateData: Partial<IPlatformSettings>): Promise<ApiResponse<IPlatformSettings>> => {
        const response = await axiosInstance.put<ApiResponse<IPlatformSettings>>(
            API_ENDPOINTS.SETTINGS.BASE, 
            updateData,
            { withCredentials: true }
        );
        return response.data;
    },


};