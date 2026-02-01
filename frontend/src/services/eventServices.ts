import axiosInstance from "@/config/axios";
import { AxiosError } from "axios";





export const eventServices = {
   createEvent: async (formData: FormData) => {
      try {
         const response = await axiosInstance.post("/api/events/create", formData, {
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
};