// frontend/src/services/notificationServices.ts

import axiosInstance from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints.constants";
import type { ApiResponse, IPaginationQueryParams } from "@/types/common.types";
import type { NotificationsResponse } from "@/types/notification.types";





export const notificationService = {
    getNotifications: async (queryParams: IPaginationQueryParams = { page: 1, limit: 10 }): Promise<ApiResponse<NotificationsResponse>> => {
        const response = await axiosInstance.get<ApiResponse<NotificationsResponse>>(
        API_ENDPOINTS.NOTIFICATION.BASE,
        { params: queryParams }
        );
        return response.data;
    },

    getUnreadCount: async (): Promise<ApiResponse<{ unreadCount: number }>> => {
        const response = await axiosInstance.get<ApiResponse<{ unreadCount: number }>>(
        API_ENDPOINTS.NOTIFICATION.UNREAD_COUNT
        );
        return response.data;
    },

    markAsRead: async (notificationId: string): Promise<ApiResponse<void>> => {
        const response = await axiosInstance.patch<ApiResponse<void>>(
        API_ENDPOINTS.NOTIFICATION.MARK_READ(notificationId)
        );
        return response.data;
    },

    markAllAsRead: async (): Promise<ApiResponse<void>> => {
        const response = await axiosInstance.patch<ApiResponse<void>>(
        API_ENDPOINTS.NOTIFICATION.MARK_ALL_READ
        );
        return response.data;
    },
};