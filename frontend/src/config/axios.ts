import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";


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




// AUTH CALLBACK STORAGE (Needs to be initialized by AuthContext)
// Store the refresh and logout functions provided by AuthContext
let refreshCallback: (() => Promise<boolean>) | null = null;
let logoutCallback: (() => void) | null = null;

/**
 * Initializes the interceptor functions from the AuthContext.
 * Must be called inside AuthProvider's useEffect hook.
 */
export const setAuthInterceptors = (
  refreshFn: () => Promise<boolean>,
  logoutFn: () => void
) => {
  refreshCallback = refreshFn;
  logoutCallback = logoutFn;
};





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
let isRefreshing = false;
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
         
         if (!refreshCallback || !logoutCallback) {
            // If callbacks aren't set, reject immediately (AuthContext not ready)
            return Promise.reject(error);
         }

         originalRequest.__isRetry = true; // Mark as retried to prevent infinite loop

         if (!isRefreshing) {
            isRefreshing = true;
         
            try {
               const success = await refreshCallback(); 
               isRefreshing = false;

               if (success) {
                  const newAccessToken = localStorage.getItem('accessToken');
                  
                  // 1. Retry all queued requests
                  processQueue(null, newAccessToken); 
                  
                  // 2. Set the header and retry the original failed request
                  if (originalRequest.headers && newAccessToken) {
                     originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                  }
                  return axiosInstance(originalRequest); 
                  
               } else {
                  // Refresh failed (e.g., refresh token expired)
                  logoutCallback(); 
                  processQueue(error);
                  return Promise.reject(error);
               }
            } catch (refreshError) {
               isRefreshing = false;
               logoutCallback();
               processQueue(refreshError as AxiosError);
               return Promise.reject(refreshError);
            }
         }

         // If a refresh is already in progress, queue the current request
         return new Promise((resolve, reject) => {
            failedRequestsQueue.push({ resolve: (token) => {
                  if (originalRequest.headers) {
                     originalRequest.headers.Authorization = `Bearer ${token}`;
                  }
                  resolve(axiosInstance(originalRequest));
            }, reject });
         });
      }

      if (error.response?.status !== 401) {
         console.error("Axios API Error:", error.response?.data || error.message);
      }

      // For all other errors (403, 500, etc.), reject normally
      return Promise.reject(error);
   }
);

export default axiosInstance;