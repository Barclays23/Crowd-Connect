// frontend/src/services/bookingServices.ts
import axiosInstance from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints.constants";
import type { PaymentMethod } from "@/constants/payment.constants";
import type { 
   IBookingState, 
   GetBookingsQueryParams , 
   InitiateBookingResponse,
   VerifyBookingPaymentPayload,
   CancelBookingPayload, 
} from "@/types/booking.types";
import type { ApiResponse } from "@/types/common.types";




export const bookingServices = {

   initiateBooking: async (eventId: string, quantity: number, paymentMethod: PaymentMethod): Promise<ApiResponse<InitiateBookingResponse>> => {
      console.log('paymentMethod choosen :', paymentMethod);
      const response = await axiosInstance.post<ApiResponse<InitiateBookingResponse>>(
         API_ENDPOINTS.BOOKING.INITIATE(eventId),
         { quantity, paymentMethod },
         { withCredentials: true }
      );
      return response.data;
   },



   verifyBookingPayment: async (payload: VerifyBookingPaymentPayload): Promise<ApiResponse<IBookingState>> => {
      const response = await axiosInstance.post<ApiResponse<IBookingState>>(
         API_ENDPOINTS.BOOKING.VERIFY_PAYMENT(payload.bookingId),
         payload,
         { withCredentials: true }
      );
      return response.data;
   },


   retryBookingPayment: async (bookingId: string, paymentMethod: PaymentMethod): Promise<ApiResponse<InitiateBookingResponse>> => {
      const response = await axiosInstance.post<ApiResponse<InitiateBookingResponse>>(
         API_ENDPOINTS.BOOKING.RETRY_PAYMENT(bookingId),
         { paymentMethod },
         { withCredentials: true }
      );
      return response.data;
   },


   
   getMyBookings: async (params: GetBookingsQueryParams = {}): Promise<ApiResponse<IBookingState[]>> => {
      const searchParams = new URLSearchParams({
         page:  String(params.page  ?? 1),
         limit: String(params.limit ?? 10),
         ...(params.search                               && { search:    params.search    }),
         ...(params.status    && params.status !== "all" && { status:    params.status    }),
         ...(params.eventFormat    && params.eventFormat !== "all" && { eventFormat:    params.eventFormat    }),
         ...(params.sortBy                               && { sortBy:    params.sortBy    }),
         ...(params.sortOrder                            && { sortOrder: params.sortOrder }),
      });

      const queryString: string  = searchParams.toString();
      const endpoint: string     = `${API_ENDPOINTS.BOOKING.MY_BOOKINGS}?${queryString}`;
      // const endpoint = queryString 
      //    ? `${API_ENDPOINTS.BOOKING.MY_BOOKINGS}?${queryString}` 
      //    : API_ENDPOINTS.BOOKING.MY_BOOKINGS;

      const response = await axiosInstance.get<ApiResponse<IBookingState[]>>(
         endpoint,
         { withCredentials: true }
      );
      return response.data;
   },



   // used anywhere?
   getBookingById: async (bookingId: string): Promise<ApiResponse<IBookingState>> => {
      const response = await axiosInstance.get<ApiResponse<IBookingState>>(
         API_ENDPOINTS.BOOKING.DETAILS(bookingId),
         { withCredentials: true }
      );
      return response.data;
   },



   getAllBookingsForAdmin: async (params: GetBookingsQueryParams = {}): Promise<ApiResponse<IBookingState[]>> => {
      const searchParams = new URLSearchParams({
         page:  String(params.page  ?? 1),
         limit: String(params.limit ?? 10),
         ...(params.search                               && { search:      params.search }),
         ...(params.status && params.status !== "all"    && { status:      params.status }),
         ...(params.eventFormat && params.eventFormat !== "all" && { eventFormat: params.eventFormat }),
         ...(params.sortBy                               && { sortBy:      params.sortBy }),
         ...(params.sortOrder                            && { sortOrder:   params.sortOrder }),
      });

      const queryString: string  = searchParams.toString();
      const endpoint: string     = `${API_ENDPOINTS.ADMIN.BOOKINGS}?${queryString}`;
      // const endpoint = queryString 
      //    ? `${API_ENDPOINTS.ADMIN.BOOKINGS}?${queryString}` 
      //    : API_ENDPOINTS.ADMIN.BOOKINGS;

      const response = await axiosInstance.get<ApiResponse<IBookingState[]>>(
         endpoint,
         { withCredentials: true }
      );
      
      return response.data;
   },



   getBookingsListOfEvent: async (eventId: string, params: GetBookingsQueryParams = {}): Promise<ApiResponse<IBookingState[]>> => {
      const searchParams = new URLSearchParams({
         page:  String(params.page  ?? 1),
         limit: String(params.limit ?? 10),
         ...(params.search                               && { search:    params.search }),
         ...(params.status && params.status !== "all"    && { status:    params.status }),
         ...(params.sortBy                               && { sortBy:    params.sortBy }),
         ...(params.sortOrder                            && { sortOrder: params.sortOrder }),
      });

      const queryString: string = searchParams.toString();
      const endpoint: string     = `${API_ENDPOINTS.EVENT}/${eventId}/bookings?${queryString}`;

      const response = await axiosInstance.get<ApiResponse<IBookingState[]>>(
         endpoint,
         { withCredentials: true }
      );
      return response.data;
   },


   cancelBookingByUser: async (bookingId: string, cancelReason: string): Promise<ApiResponse<void>> => {
      const payload: CancelBookingPayload = { cancelReason };
      const response = await axiosInstance.put<ApiResponse<void>>(
         API_ENDPOINTS.BOOKING.CANCEL(bookingId),
         payload, 
         { withCredentials: true }
      );
      return response.data;
   },


   cancelBookingByAdmin: async (bookingId: string, cancelReason: string): Promise<ApiResponse<void>> => {
      const payload: CancelBookingPayload = { cancelReason };
      const response = await axiosInstance.put<ApiResponse<void>>(
         API_ENDPOINTS.ADMIN.CANCEL_BOOKING(bookingId),
         payload, 
         { withCredentials: true }
      );
      return response.data;
   },

};

