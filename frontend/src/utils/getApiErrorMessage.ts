// src/utils/getApiErrorMessage.ts
import { AxiosError } from 'axios';
const isDevMode = import.meta.env.DEV;


export function getApiErrorMessage(error: unknown): string {

   // prevent showing double session expired message (it is already showing from axios intercepter)
   if (isUnauthorizedError(error)) {
      return ""; 
   }

   // const defaultMessage = "Something went wrong. Please try again.";
   const defaultMessage = "We’re having trouble on our side. Please try again shortly.";

   let userMessage = defaultMessage;

   if (error instanceof AxiosError) {
      const status = error.response?.status;

      // 1️⃣ Network error (backend down)
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
         userMessage = isDevMode
            ? "Backend is not running or unreachable (dev mode)"
            : "Unable to connect to the server. Please check your internet connection.";
      }

      // 2️⃣ Connection refused
      else if (error.message?.includes('ECONNREFUSED') || error.message?.includes('Failed to fetch')) {
         userMessage = isDevMode
            ? "Backend refused connection • Please make sure the backend is running. (dev mode)"
            : "Cannot reach the server right now.";
      }

      // 3️⃣ Backend JSON error (need an updation in this block.
      else if (error.response?.data?.message) {
         userMessage = error.response.data.message;
      }
      else if (error.response?.data?.error) {
         userMessage = error.response.data.error;
      }

      // 4️⃣ Route not found
      else if (status === 404) {
         userMessage = isDevMode
            ? "API endpoint not found. Backend route may be missing (dev mode)."
            : "Requested service is currently unavailable.";
      }
   }
   else if (error instanceof Error) {
      userMessage = error.message || defaultMessage;
   }

   return userMessage;
}




export function isUnauthorizedError(error: unknown): boolean {
   return (
      error instanceof AxiosError &&
      error.response?.status === 401
   );
}