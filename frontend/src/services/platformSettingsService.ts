// frontend/src/services/platformSettingsService.ts
import axiosInstance from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints.constants";
import type { ApiResponse } from "@/types/common.types";
import type { IOperationalSettings, ITermsAndConditions } from "@/types/platformSettings.types";





export const platformSettingsService = {

    getOperationalSettings: async (): Promise<ApiResponse<IOperationalSettings>> => {
        const response = await axiosInstance.get<ApiResponse<IOperationalSettings>>(
            API_ENDPOINTS.SETTINGS.OPERATIONAL,
            { withCredentials: true }
        );
        return response.data;
    },

    getTerms: async (): Promise<ApiResponse<ITermsAndConditions>> => {
        const response = await axiosInstance.get<ApiResponse<ITermsAndConditions>>(
            API_ENDPOINTS.SETTINGS.TERMS,
            { withCredentials: true }
        );
        return response.data;
    },


    updateOperationalSettings: async (updateData: Partial<IOperationalSettings>): Promise<ApiResponse<IOperationalSettings>> => {
        const response = await axiosInstance.put<ApiResponse<IOperationalSettings>>(
            API_ENDPOINTS.SETTINGS.OPERATIONAL,
            updateData,
            { withCredentials: true }
        );

        return response.data;
    },

    updateTerms: async (termsData: ITermsAndConditions): Promise<ApiResponse<ITermsAndConditions>> => {
        const response = await axiosInstance.put<ApiResponse<ITermsAndConditions>>(
            API_ENDPOINTS.SETTINGS.TERMS,
            termsData,
            { withCredentials: true }
        );

        return response.data;
    },


};