// frontend/src/services/userService.ts
import axiosInstance from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints.constants";
import type { ApiResponse } from "@/types/common.types";
import type { 
    ChangePasswordPayload, 
    GetUsersQueryParams, 
    ProfilePicUpdateData, 
    UserBasicInfoPayload, 
    UserState, 
    UserStatusUpdateData
} from "@/types/user.types";



export const userServices = {

    getUserProfile: async (): Promise<ApiResponse<UserState>> => {
        const response = await axiosInstance.get<ApiResponse<UserState>>(
            API_ENDPOINTS.USER.PROFILE, 
            { withCredentials: true }
        );
        return response.data;
    },


    // edit basic profile details by user (name & mobile)
    editUserBasicInfo: async (data: UserBasicInfoPayload): Promise<ApiResponse<UserBasicInfoPayload>> => {
        const response = await axiosInstance.patch<ApiResponse<UserBasicInfoPayload>>(
            API_ENDPOINTS.USER.BASIC_INFO, 
            data, 
            { withCredentials: true }
        );
        return response.data;
    },


    updateProfilePicture: async (formData: FormData): Promise<ApiResponse<ProfilePicUpdateData>> => {
        const response = await axiosInstance.put<ApiResponse<ProfilePicUpdateData>>(
            API_ENDPOINTS.USER.PROFILE_PIC, 
            formData, 
            { 
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data;
    },


    changePassword: async (data: ChangePasswordPayload): Promise<ApiResponse<void>> => {
        const response = await axiosInstance.patch<ApiResponse<void>>(
            API_ENDPOINTS.USER.CHANGE_PASSWORD, 
            data, 
            { withCredentials: true }
        );
        return response.data;
    },


    getAllUsers: async (params: GetUsersQueryParams = {}): Promise<ApiResponse<UserState[]>> => {
        const searchParams = new URLSearchParams({
            page:  String(params.page  ?? 1),
            limit: String(params.limit ?? 10),
            ...(params.search                             && { search: params.search }),
            ...(params.role && params.role !== "all"      && { role:   params.role }),
            ...(params.status && params.status !== "all"  && { status: params.status }),
        });

        const queryString: string  = searchParams.toString();
        const endPoint = `${API_ENDPOINTS.ADMIN.USERS}?${queryString}`;

        const response = await axiosInstance.get<ApiResponse<UserState[]>>(
            endPoint, 
            { withCredentials: true }
        );
        return response.data;
    },


    // create user by admin
    createUserService: async (formData: FormData): Promise<ApiResponse<UserState>> => {
        const response = await axiosInstance.post<ApiResponse<UserState>>(
            API_ENDPOINTS.ADMIN.USERS, 
            formData, 
            {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data;
    },


    // edit user by admin
    editUserService: async (userId: string, formData: FormData): Promise<ApiResponse<UserState>> => {
        const response = await axiosInstance.put<ApiResponse<UserState>>(
            API_ENDPOINTS.ADMIN.USER_ACTION(userId), 
            formData, 
            {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data;
    },


    toggleUserBlock: async (userId: string): Promise<ApiResponse<UserStatusUpdateData>> => {
        const response = await axiosInstance.patch<ApiResponse<UserStatusUpdateData>>(
            API_ENDPOINTS.ADMIN.TOGGLE_BLOCK(userId), 
            {}, // Empty body
            { withCredentials: true }
        );
        return response.data;
    },


    deleteUser: async (userId: string): Promise<ApiResponse<void>> => {
        const response = await axiosInstance.delete<ApiResponse<void>>(
            API_ENDPOINTS.ADMIN.USER_ACTION(userId), 
            { withCredentials: true }
        );
        return response.data;
    },
}