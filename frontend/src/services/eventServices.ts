import axiosInstance from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints.constants";
import type { ApiResponse } from "@/types/common.types";
import type { GetOrganiserEventsResult, GetPublicEventsParams, IEventState, UpdateEventStatusPayload } from "@/types/event.types";



// REQUEST/PAYLOADS

export interface CreateEventPayload {
   title: string;
   description: string;
   date: string;
   location: string;
}

export interface UpdateEventPayload {
   eventId: string;
   formData: FormData;
}

export interface CancelEventPayload {
   cancelReason: string;
}

export interface SuspendEventPayload {
   reason: string;
}



// RESPONSES

export interface EventResponse {
   id: string;
   title: string;
   description: string;
   date: string;
   location: string;
   hostId: string;
   createdAt: string;
}


export interface TrendingEventResponse {
   id: string;
   title: string;
   views: number;
}








export const eventServices = {
   createEvent: async (formData: FormData): Promise<ApiResponse<IEventState>> => {
      const response = await axiosInstance.post<ApiResponse<IEventState>>(
         API_ENDPOINTS.EVENT.CREATE, 
         formData, 
         {
            withCredentials: true,
            headers: {"Content-Type": "multipart/form-data"},
         }
      );
      return response.data;
   },


   updateEventByHost: async ({ eventId, formData }: UpdateEventPayload): Promise<ApiResponse<IEventState>> => {
      const response = await axiosInstance.patch<ApiResponse<IEventState>>(
         API_ENDPOINTS.EVENT.UPDATE(eventId), 
         formData,
         {
            withCredentials: true,
            headers: {"Content-Type": "multipart/form-data"},
         }
      );
      return response.data;
   },

   updateEventByAdmin: async ({ eventId, formData }: UpdateEventPayload): Promise<ApiResponse<IEventState>> => {
      const response = await axiosInstance.patch<ApiResponse<IEventState>>(
         API_ENDPOINTS.ADMIN.UPDATE_EVENT(eventId),
         formData,
         {
            withCredentials: true,
            headers: {"Content-Type": "multipart/form-data"},
         }
      );
      return response.data;
   },


   publishEvent: async (eventId: string): Promise<ApiResponse<void>> => {
      const response = await axiosInstance.patch<ApiResponse<void>>(
         API_ENDPOINTS.EVENT.PUBLISH(eventId)
      );
      return response.data;
   },


   // cancel by organizer (host)
   cancelEvent: async (eventId: string, cancelReason: string): Promise<ApiResponse<UpdateEventStatusPayload>> => {
      const payload: CancelEventPayload = { cancelReason };
      const response = await axiosInstance.patch<ApiResponse<UpdateEventStatusPayload>>(
         API_ENDPOINTS.EVENT.CANCEL(eventId), 
         payload
      );
      return response.data;
   },

   // suspend by admin
   suspendEvent: async (eventId: string, reason: string): Promise<ApiResponse<UpdateEventStatusPayload>> => {
      const payload: SuspendEventPayload = { reason };
      const res = await axiosInstance.patch<ApiResponse<UpdateEventStatusPayload>>(
         API_ENDPOINTS.ADMIN.SUSPEND_EVENT(eventId), 
         payload
      );
      return res.data;
   },


   // delete by admin
   deleteEvent: async (eventId: string): Promise<ApiResponse<void>> => {
      const res = await axiosInstance.delete<ApiResponse<void>>(API_ENDPOINTS.ADMIN.DELETE_EVENT(eventId));
      return res.data;
   },

   
   // for events listing in admin dashboard
   getAllEvents: async (queryString: string = ""): Promise<ApiResponse<IEventState[]>> => {
      const endPoint = queryString 
         ? `${API_ENDPOINTS.ADMIN.EVENTS}?${queryString}` 
         : API_ENDPOINTS.ADMIN.EVENTS;
                
      const response = await axiosInstance.get<ApiResponse<IEventState[]>>(endPoint, {
         withCredentials: true,
      });
      return response.data;
   },


   // for events listing in user dashboard
   getMyEvents: async (queryString: string = ""): Promise<ApiResponse<IEventState[]>> => {
      const endPoint = queryString 
         ? `${API_ENDPOINTS.EVENT.MY_EVENTS}?${queryString}` 
         : API_ENDPOINTS.EVENT.MY_EVENTS;

      const response = await axiosInstance.get<ApiResponse<IEventState[]>>(
         endPoint, 
         { withCredentials: true }
      );
      return response.data;
   },


   // for events listing in public events page
   getPublicEvents: async (params: GetPublicEventsParams = {}): Promise<ApiResponse<IEventState[]>> => {
      const searchParams = new URLSearchParams({
         page:  String(params.page  ?? 1),
         limit: String(params.limit ?? 12),
         ...(params.search                               && { search:     params.search }),
         ...(params.startDate                            && { startDate:  params.startDate }),
         ...(params.endDate                              && { endDate:    params.endDate }),
         ...(params.category && params.category !== "all"&& { category:   params.category }),
         ...(params.format && params.format !== "all"    && { format:     params.format }),
         ...(params.ticketType && params.ticketType !== "all" && { ticketType: params.ticketType }),
         ...(params.lat !== undefined                    && { lat:        params.lat.toString() }),
         ...(params.lng !== undefined                    && { lng:        params.lng.toString() }),
         ...(params.radiusKm !== undefined               && { radiusKm:   params.radiusKm.toString() }),
         ...(params.sortBy                               && { sortBy:     params.sortBy }),
      });

      const queryString: string  = searchParams.toString();
      const endPoint = `${API_ENDPOINTS.EVENT.PUBLIC_EVENTS}?${queryString}`;

      const response = await axiosInstance.get<ApiResponse<IEventState[]>>(endPoint);
      return response.data;
   },



   getTrendingEvents: async (): Promise<ApiResponse<IEventState[]>> => {
      const response = await axiosInstance.get<ApiResponse<IEventState[]>>(
         API_ENDPOINTS.EVENT.TRENDING,
         { withCredentials: true }
      );
      return response.data;
   },



   getOrganiserEvents: async (params: { hostId: string; page?: number; limit?: number }): Promise<ApiResponse<GetOrganiserEventsResult>> => {
      const searchParams = new URLSearchParams({
         page: String(params.page ?? 1),
         limit: String(params.limit ?? 10)
      });

      const queryString: string  = searchParams.toString();
      const endpoint: string     = `${API_ENDPOINTS.EVENT.ORGANISER_EVENTS(params.hostId)}?${queryString}`;
      
      const response = await axiosInstance.get<ApiResponse<GetOrganiserEventsResult>>(endpoint);

      return response.data;
   },


   getEventDetails: async (eventId: string): Promise<ApiResponse<IEventState>> => {
      const response = await axiosInstance.get<ApiResponse<IEventState>>(
         API_ENDPOINTS.EVENT.DETAILS(eventId)
      );
      return response.data;
   },
   


};