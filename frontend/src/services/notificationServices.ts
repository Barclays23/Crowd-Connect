// frontend/src/services/notificationServices.ts

import axiosInstance from "@/config/axios";
import type { ApiResponse, IPagination } from "@/types/common.types";



export interface NotificationEntity {
    notificationId: string;
    title: string;
    message: string;
    isRead: boolean;
    type: string;
    RELATED_ENTITY_TYPE?: string;
    relatedEntityId?: string;
    createdAt: string;
}

export interface GetNotificationsResponse {
    notifications: NotificationEntity[];
    pagination: IPagination;
    unreadCount: number;
}




export const notificationService = {
    getNotifications: async (page = 1, limit = 10): Promise<ApiResponse<GetNotificationsResponse>> => {
        const response = await axiosInstance.get(`/api/notifications?page=${page}&limit=${limit}`);
        return response.data;
    },
    
    getUnreadCount: async (): Promise<ApiResponse<{ unreadCount: number }>> => {
        const response = await axiosInstance.get('/api/notifications/unread-count');
        return response.data;
    },

    markAsRead: async (notificationId: string): Promise<ApiResponse<void>> => {
        const response = await axiosInstance.patch(`/api/notifications/${notificationId}/read`);
        return response.data;
    },

    markAllAsRead: async (): Promise<ApiResponse<void>> => {
        const response = await axiosInstance.patch('/api/notifications/read-all');
        return response.data;
    }
};