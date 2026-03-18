// frontend/src/services/bookingServices.ts
import axiosInstance from "@/config/axios";
import type { IBookingState, GetBookingsApiResponse, GetMyBookingsParams, GetMyBookingsResponse, InitiateBookingResponse } from "@/types/booking.types";
import type { AxiosError } from "axios";




export const bookingServices = {
   initiateBooking: async (eventId: string, quantity: number): Promise<InitiateBookingResponse> => {
      try {
         const response = await axiosInstance.post(
            `/api/event/${eventId}/initiate-booking`,
            { quantity },
            { withCredentials: true }
         );
         return response.data.data;
      } catch (error: unknown) {
         throw error as AxiosError<{ error: string }>;
      }
   },


   verifyBookingPayment: async (payload: {
      bookingId: string;
      paymentOrderId:   string;
      paymentId: string;
      signature: string;
   }): Promise<IBookingState> => {
      try {
         const response = await axiosInstance.post(
            `api/booking/${payload.bookingId}/verify-payment`,
            payload,
            { withCredentials: true }
         );

         return response.data.data;

      } catch (error: unknown) {
         throw error as AxiosError<{ error: string }>;
      }
   },


   getMyBookings: async (params: GetMyBookingsParams = {}): Promise<GetMyBookingsResponse> => {
      try {
         const searchParams = new URLSearchParams({
            page:  String(params.page  ?? 1),
            limit: String(params.limit ?? 10),
            ...(params.search                               && { search:    params.search    }),
            ...(params.status    && params.status !== "all" && { status:    params.status    }),
            ...(params.eventFormat    && params.eventFormat !== "all" && { eventFormat:    params.eventFormat    }),
            ...(params.sortBy                               && { sortBy:    params.sortBy    }),
            ...(params.sortOrder                            && { sortOrder: params.sortOrder }),
         });

         const response = await axiosInstance.get(`/api/booking/my-bookings?${searchParams.toString()}`, {
            withCredentials: true,
         });
         return response.data;
      } catch (error: unknown) {
         throw error as AxiosError<{ error: string }>;
      }
   },


   getBookingById: async (bookingId: string): Promise<IBookingState> => {
      try {
         const response = await axiosInstance.get(`/api/booking/${bookingId}`, {
            withCredentials: true,
         });
         return response.data.data;
      } catch (error: unknown) {
         throw error as AxiosError<{ error: string }>;
      }
   },



   getAllBookings: async (queryString: string): Promise<GetBookingsApiResponse> => {
      try {
         const res = await axiosInstance.get(`/api/admin/bookings?${queryString}`, {
            withCredentials: true,
         });
         return res.data;
      } catch (err: unknown) {
         throw err;
      }
   },


   cancelBookingByUser: async (bookingId: string, cancelReason: string) => {
      try {
         const response = await axiosInstance.put(`/api/booking/${bookingId}/cancel`, {cancelReason}, {
            withCredentials: true,
         });
         return response.data;
      } catch (error: unknown) {
         throw error as AxiosError<{ error: string }>;
      }
   },


   cancelBookingByAdmin: async (bookingId: string, cancelReason: string) => {
      try {
         const res = await axiosInstance.put(`/api/admin/bookings/${bookingId}/cancel`, {cancelReason}, {
            withCredentials: true,
         });
         return res.data;
      } catch (err: unknown) {
         throw err;
      }
   },

};

