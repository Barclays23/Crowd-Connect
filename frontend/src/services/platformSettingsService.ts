// frontend/src/services/platformSettingsService.ts
import axiosInstance from "@/config/axios";
import type { IPlatformSettings, SettingsResponse } from "@/types/platformSettings.types";





export const platformSettingsService = {

    getSettings: async (): Promise<SettingsResponse> => {
        const response = await axiosInstance.get("/api/settings");
        return response.data;
    },


    updateSettings: async (updateData: Partial<IPlatformSettings>): Promise<SettingsResponse> => {
        const response = await axiosInstance.put("/api/settings", updateData);
        return response.data;
    },
};