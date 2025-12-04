// frontend/src/config/axios.ts
import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { authService } from "@/services/authServices";
import { toast } from 'react-toastify';


// Define common response structure
interface ApiResponse<T = any> {
   data: T;
   message?: string;
   success: boolean;
}


// AXIOS INSTANCE CREATION & CONFIGURATION
const axiosInstance: AxiosInstance = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL,
   withCredentials: true,
   headers: {
      "Content-Type": "application/json",
   },
});



// 1. Extend the AxiosRequestConfig to include the retry flag for the interceptor logic
declare module 'axios' {
   export interface InternalAxiosRequestConfig {
      __isRetry?: boolean;
   }
}








// STATIC REQUEST INTERCEPTOR (Attaches current Access Token)
axiosInstance.interceptors.request.use(
   (config: InternalAxiosRequestConfig) => {
      // IMPORTANT FIX: Use the correct key 'accessToken'
      const token = localStorage.getItem("accessToken"); 

      if (token && config.headers) {
         config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
);





// DYNAMIC RESPONSE INTERCEPTOR (Handles 401 Unauthorized & Token Refresh)
let isRefreshingToken = false;

let failedRequestsQueue: Array<{ 
  resolve: (value: any) => void; 
  reject: (reason?: any) => void; 
}> = [];


const processQueue = (error: AxiosError | null, token: string | null = null) => {
   failedRequestsQueue.forEach(promise => {
      if (error) {
         promise.reject(error);
      } else if (token) {
         // Resolve the promise, which triggers the retry with the new token
         promise.resolve(token); 
      }
   });
   failedRequestsQueue = [];
};






axiosInstance.interceptors.response.use(
   (response: AxiosResponse) => response,
   async (error: AxiosError) => {
      const originalRequest = error.config;

      console.error(`❌ error in axiosInstance.interceptors.response:)`, error.response?.data || error.message);
      
      // Define endpoints that should NOT trigger token refresh
      const excludedEndpoints = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh-token'];
      const isExcludedEndpoint = excludedEndpoints.some(endpoint => 
         originalRequest?.url?.includes(endpoint)
      );

      // Check for 401, a defined config, and that it hasn't been retried yet
      // AND it's not a login/register request
      if (
         error.response?.status === 401 && 
         originalRequest && 
         !originalRequest.__isRetry &&
         !isExcludedEndpoint
      ) {

         originalRequest.__isRetry = true; // Mark as retried to prevent infinite loop
         
         // If refresh is already in progress, queue this request
         if (isRefreshingToken) {
            return new Promise((resolve, reject) => {
               failedRequestsQueue.push({ 
                  resolve: (token) => {
                     if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                     }
                     resolve(axiosInstance(originalRequest));
                  }, 
                  reject
               });
            });
         }


         // Start token refresh process
         isRefreshingToken = true;


         try {
            console.log('Attempting to refresh access token');
               
            const response = await authService.refreshTokenService();
            console.log('Refresh token response in intercepter :', response);

            const { newAccessToken, message } = response;
               
            if (!newAccessToken){
               throw new Error("No new access token received in interceptor.");
            }
            

            // Save the new token to localStorage
            // console.log('localStorage accessToken before:', localStorage.getItem("accessToken"));
            localStorage.setItem("accessToken", newAccessToken);
            // console.log('localStorage accessToken after:', localStorage.getItem("accessToken"));

            // Retry all queued requests with the new token
            processQueue(null, newAccessToken);

            // Set the header and retry the original failed request with new token.
            if (originalRequest.headers) {
               originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            return axiosInstance(originalRequest);


         } catch (refreshError) {    
            // received error from auth.services ➜ auth.controller ➜ axios intercepter OR
            // received error from jwt.utils ➜ auth.services ➜ auth.controller ➜ axios intercepter

            console.error('refreshError in intercepter :', refreshError);
            const serverMessage = typeof (refreshError as AxiosError).response?.data === 'object' && (refreshError as AxiosError).response?.data !== null
               ? ((refreshError as AxiosError).response?.data as { message?: string }).message
               : undefined;
            const defaultMessage = (refreshError as Error).message; // e.g., "Request failed with status code 401"

            // const refreshErrorMessage = (refreshError as AxiosError).response?.data || (refreshError as Error).message;
            const refreshErrorMessage = serverMessage || defaultMessage;
            console.error('refreshErrorMessage in interceptor:', refreshErrorMessage);

            toast.info(refreshErrorMessage)

            // call logout service to clear server-side session.
            const res = await authService.logoutService();
            console.log('Logout response after refresh token failure :', res);

            // Clear the stored tokens and user data from localStorage.
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");

            processQueue(refreshError as AxiosError, null);
            return Promise.reject(refreshError);

         } finally {
            isRefreshingToken = false;
         }
      }


      // If the error is not 401 or is from excluded endpoints, just log and reject.
      if (error.response?.status !== 401) {
         console.error("Axios API Error:", error.response?.data || error.message);
      }

      // For all other non-token related errors (403, 500, etc.), reject normally
      return Promise.reject(error);
   }
);




                  






      


export default axiosInstance;