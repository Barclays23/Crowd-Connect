import axiosInstance from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints.constants";
import { USER_ROLES } from "@/constants/user-system.constants";
import type { ApiResponse } from "@/types/common.types";
import type { 
  GetHostsQueryParams, 
  HostStatusUpdateData, 
  ManageHostApplicationPayload, 
  ManageHostPermissionsPayload, 
  OrganiserProfileData, 
  UserState 
} from "@/types/user.types";




export const hostServices = {

  // apply by user to upgrade to host
  applyHostUpgrade: async (formData: FormData): Promise<ApiResponse<UserState>> => {
    const response = await axiosInstance.post<ApiResponse<UserState>>(
      API_ENDPOINTS.HOST.APPLY_UPGRADE, 
      formData,
      {
        withCredentials: true,
        headers: {"Content-Type": "multipart/form-data"},
      }
    );

    return response.data;
  },



  manageHostApplication: async (hostId: string, payload: ManageHostApplicationPayload): Promise<ApiResponse<HostStatusUpdateData>> => {
    const response = await axiosInstance.patch<ApiResponse<HostStatusUpdateData>>(
      API_ENDPOINTS.ADMIN.MANAGE_HOST_APPLICATION(hostId), 
      payload, 
      { withCredentials: true }
    );

    return response.data;
  },


  manageHostPermissions: async (hostId: string, payload: ManageHostPermissionsPayload): Promise<ApiResponse<HostStatusUpdateData>> => {
    const response = await axiosInstance.patch<ApiResponse<HostStatusUpdateData>>(
      API_ENDPOINTS.ADMIN.MANAGE_HOST_PERMISSION(hostId), 
      payload, 
      { withCredentials: true }
    );
    return response.data;
  },



  getAllHosts: async (params: GetHostsQueryParams = {}): Promise<ApiResponse<UserState[]>> => {
    // Isolate URL serialization within the service layer
    const searchParams = new URLSearchParams({
      page:  String(params.page  ?? 1),
      limit: String(params.limit ?? 10),
      role: USER_ROLES.HOST,
      ...(params.search                                 && { search:     params.search }),
      ...(params.status && params.status !== "all"      && { status:     params.status }),
      ...(params.hostStatus && params.hostStatus !== "all" && { hostStatus: params.hostStatus }),
    });

    const queryString: string  = searchParams.toString();
    const endPoint = `${API_ENDPOINTS.ADMIN.HOSTS}?${queryString}`;

    const response = await axiosInstance.get<ApiResponse<UserState[]>>(
      endPoint,
      { withCredentials: true },
    );

    return response.data;
  },



  getOrganiserProfile: async (hostId: string): Promise<ApiResponse<OrganiserProfileData>> => {
    const response = await axiosInstance.get<ApiResponse<OrganiserProfileData>>(
      API_ENDPOINTS.HOST.ORGANISER_PROFILE(hostId)
    );
    return response.data;
  },



  // update organizer details by host user
  updateHostDetailsByHost: async (formData: FormData): Promise<ApiResponse<UserState>> => {
    const response = await axiosInstance.patch<ApiResponse<UserState>>(
      API_ENDPOINTS.HOST.ORGANIZER_DETAILS,
      formData,
      { 
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      },
    );
    return response.data;
  },


  // update organizer details by host user
  updateHostLogoByHost: async (formData: FormData): Promise<ApiResponse<UserState>> => {
    const response = await axiosInstance.patch<ApiResponse<UserState>>(
      API_ENDPOINTS.HOST.ORGANIZER_LOGO,
      formData,
      {
        withCredentials: true,
        headers: {"Content-Type": "multipart/form-data"},
      }
    );
    return response.data;
  },


  // update organizer details by admin
  updateHostDetailsByAdmin: async (hostId: string, formData: FormData): Promise<ApiResponse<UserState>> => {
    const response = await axiosInstance.put<ApiResponse<UserState>>(
      API_ENDPOINTS.ADMIN.UPDATE_HOST_DETAILS(hostId),
      formData,
      {
        withCredentials: true,
        headers: {"Content-Type": "multipart/form-data"},
      }
    );

    return response.data;
  },


  // update organizer logo by admin
  updateHostLogoByAdmin: async (hostId: string, formData: FormData): Promise<ApiResponse<UserState>> => {
    const response = await axiosInstance.patch<ApiResponse<UserState>>(
      API_ENDPOINTS.ADMIN.UPDATE_HOST_LOGO(hostId),
      formData,
      {
        withCredentials: true,
        headers: {"Content-Type": "multipart/form-data"},
      }
    );
    return response.data;
  },



  // convert user to host by admin
  convertToHost: async (userId: string, formData: FormData): Promise<ApiResponse<UserState>> => {
    const response = await axiosInstance.post<ApiResponse<UserState>>(
      API_ENDPOINTS.ADMIN.CONVERT_TO_HOST(userId),
      formData,
      {
        withCredentials: true,
        headers: {"Content-Type": "multipart/form-data"},
      }
    );

    return response.data;
  },





}






