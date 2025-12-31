import axiosInstance from "@/config/axios";
import type { AxiosError } from "axios";




export const hostServices = {

    applyHostUpgrade: async (data: FormData) => {
        try {
            const response = await axiosInstance.post("/api/host/apply-upgrade", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });
            return response.data;
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },






}