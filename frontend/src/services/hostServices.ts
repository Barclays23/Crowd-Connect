import axiosInstance from "@/config/axios";
import type { AxiosError } from "axios";




export const hostServices = {

    // apply by user to upgrade to host
    applyHostUpgrade: async (data: FormData) => {
        try {
            const response = await axiosInstance.post("/api/host/apply-upgrade", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });
            return response.data;
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },


    manageHostRequest: async ({hostId, action, reason}: {
      hostId: string, 
      action: "approve" | "reject",
      reason?: string
    }) => {
      console.log('hostId: ', hostId, '- action: ', action, '- reason: ', reason);
      try {
          const url = `/api/admin/hosts/${hostId}/manage-host-request`;
          const response = await axiosInstance.patch(
            url, 
            { action, reason }, 
            { withCredentials: true}
          );
          return response.data;
      } catch (error: unknown) {
          const err = error as AxiosError<{ error: string }>;
          throw err;
      }
    },


    getAllHosts: async (queryParams?: string) => {
        try {
            const url = queryParams ? `/api/admin/hosts?${queryParams}` : `/api/admin/hosts`;
            const response = await axiosInstance.get(url, {
                withCredentials: true,
            });
            return response.data;
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },


    // convert to host by admin
    convertToHost: async (userId: string, formData: FormData) => {
      try {
        const response = await axiosInstance.post(
          `/api/admin/users/${userId}/convert-host`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
        return response.data;
      } catch (error: unknown) {
        const err = error as AxiosError<{ error: string | { message: string } }>;
        throw err.response?.data || { error: "Failed to convert user to host" };
      }
    },
    

    // update host details by admin
    updateHostDetailsByAdmin: async (userId: string, formData: FormData) => {
      try {
        const response = await axiosInstance.put(
          `/api/admin/hosts/${userId}/update-host`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
        return response.data;
      } catch (error: unknown) {
        const err = error as AxiosError<{ error: string | { message: string } }>;
        throw err.response?.data || { error: "Failed to update host details (admin)" };
      }
    },
    
    
    // update host details by host user
    updateHostDetailsByHost: async (formData: FormData) => {
      try {
        const response = await axiosInstance.patch(
          "/api/host/my-details",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
        return response.data;
      } catch (error: unknown) {
        const err = error as AxiosError<{ error: string | { message: string } }>;
        throw err.response?.data || { error: "Failed to update host details" };
      }
    },
}






