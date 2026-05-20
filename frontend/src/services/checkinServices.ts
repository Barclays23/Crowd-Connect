// frontend/src/services/checkinServices.ts


import axiosInstance from "@/config/axios";
import type { CheckInResult, GetAttendanceResult } from "@/types/checkin.types";



export const checkinServices = {

    async scanQRCode(
        eventId:    string,
        qrToken:    string,
        entryCount: number,
    ): Promise<{ message: string; data: CheckInResult }> {
        const res = await axiosInstance.post(`api/event/${eventId}/checkin`, {
            qrToken,
            entryCount,
        });

        return res.data;
    },


    async getAttendance(eventId: string): Promise<{success: true, data: GetAttendanceResult}> {
        const res = await axiosInstance.get(`api/event/${eventId}/checkin/attendance`);
        return res.data;
    },


};