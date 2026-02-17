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


   suspendEvent: async (eventId: string, reason: string) => {
      const res = await axiosInstance.patch(`/api/admin/events/${eventId}/suspend`, { reason });
      return res.data;
   },

   deleteEvent: async (eventId: string) => {
      const res = await axiosInstance.delete(`/api/admin/events/${eventId}`);
      return res.data;
   },


};