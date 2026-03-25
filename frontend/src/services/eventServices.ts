import axiosInstance from "@/config/axios";
import type { GetEventsApiResponse } from "@/types/event.types";





export const eventServices = {
   createEvent: async (formData: FormData) => {
      const response = await axiosInstance.post("/api/event/create-event", formData, {
         withCredentials: true,
         headers: {
           "Content-Type": "multipart/form-data",
         },
      });
      return response.data;
   },


   updateEventByHost: async ({eventId, formData}: {eventId: string, formData: FormData}) => {
      const response = await axiosInstance.patch(`/api/event/${eventId}/update`, formData, {
         withCredentials: true,
         headers: {
           "Content-Type": "multipart/form-data",
         },
      });
      return response.data;
   },

   updateEventByAdmin: async ({eventId, formData}: {eventId: string, formData: FormData}) => {
      const response = await axiosInstance.patch(`/api/admin/events/${eventId}/update`, formData, {
         withCredentials: true,
         headers: {
           "Content-Type": "multipart/form-data",
         },
      });
      return response.data;
   },


   publishEvent: async (eventId: string)=> {
      const response = await axiosInstance.patch(`/api/event/${eventId}/publish`);
      return response.data;
   },

   // cancel by organizer
   cancelEvent: async (eventId: string, cancelReason: string) => {
      const response = await axiosInstance.patch(`/api/event/${eventId}/cancel`, { cancelReason });
      return response.data;
   },


   // suspend by admin
   suspendEvent: async (eventId: string, reason: string) => {
      const res = await axiosInstance.patch(`/api/admin/events/${eventId}/suspend`, { reason });
      return res.data;
   },


   // delete by admin
   deleteEvent: async (eventId: string) => {
      const res = await axiosInstance.delete(`/api/admin/events/${eventId}`);
      return res.data;
   },

   
   // for events listing in admin dashboard
   getAllEvents: async (queryString: string = "") => {
      const response = await axiosInstance.get(`/api/admin/events${queryString ? `?${queryString}` : ""}`, {
         withCredentials: true,
      });
      return response.data;
   },


   // for events listing in user dashboard
   getMyEvents: async (queryString: string = "") => {
      const response = await axiosInstance.get(`/api/event/my-events${queryString ? `?${queryString}` : ""}`, {
         withCredentials: true,
      });
      return response.data;
   },


   // for events listing in public events page
   getPublicEvents: async (queryString: string = ""): Promise<GetEventsApiResponse> => {
      console.log('getPublicEvents queryString :', queryString)
      const response = await axiosInstance.get(`/api/event/public-events${queryString ? `?${queryString}` : ""}`);
      return response.data;
   },



   trendingEvents: async () => {
      const response = await axiosInstance.get("/api/event/trending-events", {withCredentials: true});
      return response.data;
   },


   getEventDetails: async (eventId: string = "") => {
      const response = await axiosInstance.get(`/api/event/events/${eventId}`);
      return response.data;
   },
   


};