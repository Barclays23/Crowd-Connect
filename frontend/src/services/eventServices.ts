import axiosInstance from "@/config/axios";
import { AxiosError } from "axios";





export const eventServices = {
   createEvent: async (formData: FormData) => {
      try {
         const response = await axiosInstance.post("/api/event/create-event", formData, {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
         });
         return response.data;
      } catch (error: unknown) {
         const err = error as AxiosError<{ error: string }>;
         throw err;
      }
   },


   updateEvent: async ({eventId, formData}: {eventId: string, formData: FormData}) => {
      try {
         const response = await axiosInstance.patch(`/api/event/${eventId}/update`, formData, {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
         });
         return response.data;
      } catch (error: unknown) {
         const err = error as AxiosError<{ error: string }>;
         throw err;
      }
   },


   async publishEvent(eventId: string) {
      const response = await axiosInstance.patch(`/api/event/${eventId}/publish`);
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
      try {
         const response = await axiosInstance.get(`/api/admin/events${queryString ? `?${queryString}` : ""}`, {
            withCredentials: true,
         });
         return response.data;
      } catch (error) {
         throw error;
      }
   },


   // for events listing in user dashboard
   getMyEvents: async (queryString: string = "") => {
      try {
         const response = await axiosInstance.get(`/api/event/my-events${queryString ? `?${queryString}` : ""}`, {
            withCredentials: true,
         });
         return response.data;
      } catch (error) {
         throw error;
      }
   },


   // for events listing in public events page
   getPublicEvents: async (queryString: string = "") => {
      try {
         const response = await axiosInstance.get(`/api/event/public-events${queryString ? `?${queryString}` : ""}`);
         return response.data;
      } catch (error) {
         throw error;
      }
   },


   getEventById: async (eventId: string = "") => {
      try {
         const response = await axiosInstance.get(`/api/event/events/${eventId}`);
         return response.data;
      } catch (error) {
         throw error;
      }
   },
   


};