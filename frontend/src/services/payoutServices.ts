// frontend/src/services/payoutServices.ts
import axiosInstance from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints.constants";
import type { ApiResponse } from "@/types/common.types";
import type {
   EligibleEventsData,
   IPayoutState,
   GetPayoutsQueryParams,
   ReviewPayoutPayload,
} from "@/types/payout.types";





export const payoutServices = {

    // ── Host Side ──────────────────────────────────────────────────────────────

    // payout eligible events where a payout can be requested
    getEligibleEvents: async (): Promise<ApiResponse<EligibleEventsData>> => {
        const response = await axiosInstance.get<ApiResponse<EligibleEventsData>>(
            API_ENDPOINTS.PAYOUT.ELIGIBLE_EVENTS, 
            { withCredentials: true }
        );
        return response.data;
    },


    // host submits a payout request for an event
    requestPayout: async (eventId: string, formData: FormData): Promise<ApiResponse<IPayoutState>> => {
        const response = await axiosInstance.post<ApiResponse<IPayoutState>>(
            API_ENDPOINTS.PAYOUT.REQUEST(eventId), 
            formData, 
            {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return response.data;
    },


    // get host's own payouts
    getMyPayouts: async (params: GetPayoutsQueryParams = {}): Promise<ApiResponse<IPayoutState[]>> => {
        const searchParams = new URLSearchParams({
            page:  String(params.page  ?? 1),
            limit: String(params.limit ?? 10),
            ...(params.sortBy                               && { sortBy:    params.sortBy }),
            ...(params.sortOrder                            && { sortOrder: params.sortOrder }),
            ...(params.status && params.status !== "all"    && { status:    params.status }),
            ...(params.search                               && { search:    params.search }),
        });

        const queryString: string  = searchParams.toString();
        const endpoint = `${API_ENDPOINTS.PAYOUT.MY_PAYOUTS}?${queryString}`;

        const response = await axiosInstance.get<ApiResponse<IPayoutState[]>>(
            endpoint, 
            { withCredentials: true }
        );
        return response.data;
    },


    // ── Admin Side ─────────────────────────────────────────────────────────────

    getAllPayouts: async (params: GetPayoutsQueryParams = {}): Promise<ApiResponse<IPayoutState[]>> => {
        const searchParams = new URLSearchParams({
            page:  String(params.page  ?? 1),
            limit: String(params.limit ?? 10),
            ...(params.sortBy                               && { sortBy:    params.sortBy }),
            ...(params.sortOrder                            && { sortOrder: params.sortOrder }),
            ...(params.status && params.status !== "all"    && { status:    params.status }),
            ...(params.search                               && { search:    params.search }),
        });

        const queryString: string  = searchParams.toString();
        const endpoint = `${API_ENDPOINTS.ADMIN.PAYOUTS}?${queryString}`;

        const response = await axiosInstance.get<ApiResponse<IPayoutState[]>>(
            endpoint, 
            { withCredentials: true }
        );
        return response.data;
    },
    
    
    // admin review payouts — approve or reject
    reviewPayout: async (payoutId: string, payload: ReviewPayoutPayload): Promise<ApiResponse<IPayoutState>> => {
        const response = await axiosInstance.put<ApiResponse<IPayoutState>>(
            API_ENDPOINTS.ADMIN.REVIEW_PAYOUT(payoutId), 
            payload,
            { withCredentials: true }
        );
        return response.data;
    },
};