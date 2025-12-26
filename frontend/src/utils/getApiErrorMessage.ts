// src/utils/getApiErrorMessage.ts
import { AxiosError } from 'axios';
const isDevMode = import.meta.env.DEV;

/**
 * Returns the message so you can use it elsewhere if needed.
 */
export function getApiErrorMessage(error: unknown): string {
   const defaultMessage: string = "Something went wrong. Please try again."
   let userMessage: string = defaultMessage;

   // Handle network errors first (most common during dev when backend is off)
   if (error instanceof AxiosError) {
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
         // During development we want to be more honest
         userMessage = isDevMode
         ? "Backend is not running or unreachable (dev mode)"
         : "Unable to connect to the server. Please check your internet connection.";
      }
      // Additional network-related cases (e.g. backend refused connection)
      else if (error.message?.includes('ECONNREFUSED') || error.message?.includes('Failed to fetch')) {
         userMessage = isDevMode
            ? "Backend refused connection • Please make sure the backend is running. (dev mode)"
            : "Cannot reach the server right now.";
      }
      // Backend sent a proper error response (400, 401, 429, etc.)
      else if (error.response?.data?.message) {
         userMessage = error.response.data.message;
      }
      else if (error.response?.data?.error) {
         userMessage = error.response.data.error;
      }
   }
   // Fallback for any other unexpected error (non-Axios)
   else if (error instanceof Error) {
      userMessage = error.message || defaultMessage;
   }

   return userMessage;
}