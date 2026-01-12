import axiosInstance from "@/config/axios";
import type { AxiosError } from "axios";


// to update user basic info (name & mobile) by user himself
export interface UserBasicInfo {
    name?: string;
    mobile?: string;
    // email?: string;  // separate editing
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

    getUserProfile: async () => {
        try {
            const response = await axiosInstance.get('/api/user/profile', { withCredentials: true });
            return response.data;
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },



    // edit basic profile details by user (name & mobile)
    editUserBasicInfo: async (data: UserBasicInfo) => {
        try {
            const response = await axiosInstance.patch("/api/user/edit-basic-info", data, { withCredentials: true });
            return response.data;

        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },


    updateProfilePicture: async (formData: FormData) => {
        try {
            const response = await axiosInstance.put("/api/user/profile-pic", formData, { 
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



    toggleUserBlock: async (userId: string) => {
        try {
            const response = await axiosInstance.patch(`/api/admin/users/${userId}/toggle-block`, {
                withCredentials: true,
            });
            return response.data;
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },


    deleteUser: async (userId: string) => {
        try {
            const response = await axiosInstance.delete(`/api/admin/users/${userId}`, {
                withCredentials: true,
            });
            return response.data;
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },
}