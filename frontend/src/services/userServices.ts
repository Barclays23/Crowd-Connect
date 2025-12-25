import axiosInstance from "@/config/axios";
import type { AxiosError } from "axios";


// to update user profile by user himself
interface UserProfileData {
    name?: string;
    email?: string;
    mobile?: string;
    // add other profile fields as needed
}



// add user or edit user by admin
// interface UserFormData {
//     name: string;
//     email: string;
//     mobile?: string;
//     role: string;
//     status: string;
//     profilePic: File | undefined;
// }


        //  const userFormData = {
        //    name: values.name,
        //    email: values.email,
        //    mobile: values.mobile,
        //    role: values.role,
        //    status: values.status,
        //    // If your editUserService supports profilePic as a file, add it here
        //    profilePic: profileFile || undefined,
        //  };








export const userServices = {

    // edit profile by user
    editProfileService: async (data: UserProfileData) => {
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
    },



    // edit user by admin
    editUserService: async (userId: string, formData: FormData) => {
        try {
            const response = await axiosInstance.put(`/api/admin/users/${userId}`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;

        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },


    // create user by admin
    createUserService: async (formData: FormData) => {
        try {
            console.log('formData received in createUserService :', formData);
            const response = await axiosInstance.post(`/api/admin/users`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },


}