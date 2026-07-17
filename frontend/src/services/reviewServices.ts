// frontend/src/services/reviewServices.ts
import axiosInstance from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints.constants";
import type { ApiResponse } from "@/types/common.types";
import type { EditReviewPayload, GetReviewsResponse, SubmitReviewPayload } from "@/types/review.types";




export const reviewServices = {
    submitReview: async (payload: SubmitReviewPayload): Promise<ApiResponse<void>> => {
        const response = await axiosInstance.post<ApiResponse<void>>(
            // API_ENDPOINTS.REVIEW.SUBMIT_REVIEW(payload.bookingId),
            API_ENDPOINTS.REVIEW.SUBMIT_REVIEW,
            payload,
            { withCredentials: true }
        );

        return response.data;
    },


    editReview: async (reviewId: string, payload: EditReviewPayload): Promise<ApiResponse<void>> => {
        const response = await axiosInstance.put<ApiResponse<void>>(
            API_ENDPOINTS.REVIEW.MANAGE_REVIEW(reviewId),
            payload,
            { withCredentials: true }
        );
        
        return response.data;
    },


    deleteReview: async (reviewId: string): Promise<ApiResponse<void>> => {
        const response = await axiosInstance.delete<ApiResponse<void>>(
            API_ENDPOINTS.REVIEW.MANAGE_REVIEW(reviewId),
            { withCredentials: true }
        );

        return response.data;
    },
  

    getHostReviews: async (hostId: string, page = 1, limit = 10): Promise<ApiResponse<GetReviewsResponse>> => {
        const searchParams = new URLSearchParams({
            page: String(page),
            limit: String(limit)
        });
        const queryString = searchParams.toString();
        const endpoint = `${API_ENDPOINTS.REVIEW.HOST_REVIEWS(hostId)}?${queryString}`;

        const response = await axiosInstance.get<ApiResponse<any>>(endpoint);

        return response.data;
    }
};