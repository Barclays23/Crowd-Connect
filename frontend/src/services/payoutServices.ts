// frontend/src/services/payoutServices.ts
import axiosInstance from "@/config/axios";
import type {
   GetPayoutsApiResponse,
   GetEligibleEventsApiResponse,
   RequestPayoutBody,
   ReviewPayoutBody,
} from "@/types/payout.types";





export const payoutServices = {

    // ── Host Side ──────────────────────────────────────────────────────────────

    // payout eligible events where a payout can be requested
    getEligibleEvents: async (): Promise<GetEligibleEventsApiResponse> => {
        const res = await axiosInstance.get("/api/payout/eligible-events");
        return res.data;
    },


    // host submits a payout request for an event
    requestPayout: async (formData: FormData): Promise<{ message: string }> => {
        const res = await axiosInstance.post("/api/payouts/request", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },


    // get host's own payouts
    getMyPayouts: async (queryString: string): Promise<GetPayoutsApiResponse> => {
        const res = await axiosInstance.get(`/api/payout/my-payouts?${queryString}`);
        return res.data;
    },


    // ── Admin Side ─────────────────────────────────────────────────────────────

    // get all payouts
    getAllPayouts: async (queryString: string): Promise<GetPayoutsApiResponse> => {
        const res = await axiosInstance.get(`/api/admin/payouts?${queryString}`);
        return res.data;
    },


    // admin review payouts — approve or reject
    reviewPayout: async (payoutId: string, body: ReviewPayoutBody): Promise<{ message: string }> => {
        const res = await axiosInstance.put(`api/admin/payouts/${payoutId}/review`, body);
        return res.data;
    },
};