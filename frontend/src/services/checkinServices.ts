// frontend/src/services/checkinServices.ts


import axiosInstance from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints.constants";
import type { 
    CheckInResult, 
    GetAttendanceResult, 
    ScanQRCodePayload 
} from "@/types/checkin.types";
import type { ApiResponse } from "@/types/common.types";



export const checkinServices = {

    async scanQRCode(payload: ScanQRCodePayload): Promise<ApiResponse<CheckInResult>> {
        const { eventId, qrToken, entryCount } = payload;

        const res = await axiosInstance.post<ApiResponse<CheckInResult>>(
            // `/api/event/${eventId}/checkin`,
            API_ENDPOINTS.CHECKIN.QR_SCAN(eventId),
            { qrToken, entryCount },
            { withCredentials: true }
        );

        return res.data;
    },


    async getAttendance(eventId: string): Promise<ApiResponse<GetAttendanceResult>> {
        const res = await axiosInstance.get<ApiResponse<GetAttendanceResult>>(
            // `/api/event/${eventId}/checkin/attendance`,
            API_ENDPOINTS.CHECKIN.ATTENDEES(eventId),
            { withCredentials: true }
        );
        return res.data;
    },


};