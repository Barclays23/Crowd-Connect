// frontend/src/services/bookingServices.ts
import axiosInstance from "@/config/axios";
import type { 
   IBookingState, 
   GetBookingsApiResponse, 
   GetMyBookingsParams, 
   GetMyBookingsResponse, 
   InitiateBookingResponse 
} from "@/types/booking.types";




export const bookingServices = {
   initiateBooking: async (eventId: string, quantity: number): Promise<InitiateBookingResponse> => {
      const response = await axiosInstance.post(
         `/api/event/${eventId}/initiate-booking`,
         { quantity },
         { withCredentials: true }
      );
      return response.data.data;
   },


   verifyBookingPayment: async (payload: {
      bookingId: string;
      paymentOrderId:   string;
      paymentId: string;
      signature: string;
   }): Promise<IBookingState> => {
      const response = await axiosInstance.post(
         `api/booking/${payload.bookingId}/verify-payment`, payload,
         { withCredentials: true }
      );

      return response.data.data;
   },


   getMyBookings: async (params: GetMyBookingsParams = {}): Promise<GetMyBookingsResponse> => {
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
   },


   getBookingById: async (bookingId: string): Promise<IBookingState> => {
      const response = await axiosInstance.get(`/api/booking/${bookingId}`, {
         withCredentials: true,
      });
      return response.data.data;
   },



   getAllBookingsForAdmin: async (queryString: string): Promise<GetBookingsApiResponse> => {
      const res = await axiosInstance.get(`/api/admin/bookings?${queryString}`, {
         withCredentials: true,
      });
      return res.data;
   },


   // getBookingsListOfEvent: async (userRole: UserRole | undefined, queryString: string): Promise<GetBookingsApiResponse> => {
   //    const res = await axiosInstance.get(`/api/event/bookings?${queryString}`, {
   //       withCredentials: true,
   //    });
   //    return res.data;
   // },

   // interface BookingQueryParams {
   //    page: string;
   //    limit: string;
   //    sortBy: string;
   //    sortOrder: string;
   //    search?: string;
   //    status?: string;
   // }

   getBookingsListOfEvent: async (eventId: string, queryString: string): Promise<GetBookingsApiResponse> => {
      const res = await axiosInstance.get(`/api/event/${eventId}/bookings?${queryString}`, {
         withCredentials: true,
      });
      return res.data;
   },


   cancelBookingByUser: async (bookingId: string, cancelReason: string) => {
      const response = await axiosInstance.put(`/api/booking/${bookingId}/cancel`, {cancelReason}, {
         withCredentials: true,
      });
      return response.data;
   },


   cancelBookingByAdmin: async (bookingId: string, cancelReason: string) => {
      const res = await axiosInstance.put(`/api/admin/bookings/${bookingId}/cancel`, {cancelReason}, {
         withCredentials: true,
      });
      return res.data;
   },

};

