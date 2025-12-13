import axiosInstance from "@/config/axios";
import type { AxiosError } from "axios";




interface UserFormData {
  name?: string;
  email: string;
  mobile?: string;
}








export const userServices = {

    editProfileService: async (data: UserFormData) => {
        try {
            // console.log('data received in registerService :', data)
            const response = await axiosInstance.post("/api/auth/edit-profile", data, { withCredentials: true });
            // return { data: response.data, error: null };
            return response.data;

        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },


    getAllUsers: async (queryString: string = "") => {
        try {
            const response = await axiosInstance.get(`/api/admin/users${queryString ? `?${queryString}` : ""}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    }


}