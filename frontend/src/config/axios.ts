// frontend/src/config/axios.ts
import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { authService } from "@/services/authServices";
import { toast } from 'react-toastify';



// AXIOS INSTANCE CREATION & CONFIGURATION
const axiosInstance: AxiosInstance = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL,
   withCredentials: true,
   // headers: {
   //    "Content-Type": "application/json",
   // },
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
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];


// 1. Declare a variable to hold the logout function
let onTokenRefreshFailure: (() => Promise<unknown>) | null = null;

// 2. Export a setter function to inject the logout callback
export const setAuthInterceptors = (
   logoutCallback: () => Promise<unknown>
) => {
   onTokenRefreshFailure = logoutCallback;
};


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
      // const excludedEndpoints = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh-token'];
      // const isExcludedEndpoint = excludedEndpoints.some(endpoint => 
      //    originalRequest?.url?.includes(endpoint)
      // );

      // Define endpoints that should NOT trigger token refresh
      const isExcluded = [
         '/api/auth/login',
         '/api/auth/register',
         '/api/auth/refresh-token'
      ].some(endpoint => 
         originalRequest?.url?.startsWith(endpoint) || originalRequest?.url?.includes(endpoint)
      );

      // Check for 401, a defined config, and that it hasn't been retried yet
      // AND it's not a login/register request
      if (
         error.response?.status === 401 && 
         originalRequest && 
         !originalRequest.__isRetry &&
         // !isExcludedEndpoint
         !isExcluded
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

            console.log(`Token refreshed successfully → retrying original request: ${originalRequest?.url}`);
            
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


            if (onTokenRefreshFailure) {
               // Show toast first, it will persist because navigation is stateful (React Router)
               toast.info(refreshErrorMessage);
               // Call the injected function which handles state clearing and navigation
               await onTokenRefreshFailure();
            } else {
               // Fallback for safety (though AuthContext should always inject this)
               console.warn("Logout callback not initialized. Manual local storage clear and forced reload.");
               localStorage.removeItem("accessToken");
               localStorage.removeItem("user");   
               window.location.href = '/login';
            }
            

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