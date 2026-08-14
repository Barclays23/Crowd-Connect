// frontend/src/utils/errorMessages.utils.ts
import type { ApiResponse } from '@/types/common.types';
import { AxiosError } from 'axios';
const isDevMode: boolean = import.meta.env.DEV;


export function getApiErrorMessage(error: unknown): string {

   // prevent showing double session expired message (it is already showing from axios intercepter)
   
   // if (isUnauthorizedError(error)) {
   //    return ""; 
   // }

   // if (isSessionExpiredError(error)) {
   //    return "";
   // }

   if (shouldSkipToast(error)) return "";


   // const defaultMessage = "Something went wrong. Please try again.";
   const defaultMessage = "We’re having trouble on our side. Please try again shortly.";

   let userMessage = defaultMessage;

   if (error instanceof AxiosError) {
      const status: number | undefined = error.response?.status;
      const responseBody: ApiResponse<ApiErrorData<string>> = error.response?.data as ApiResponse<ApiErrorData>;

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

      // 3️⃣ Backend JSON error (Mapped to new ApiResponse model)
      else if (responseBody?.message) {
         if (status && status >= 500) {
            userMessage = isDevMode 
               ? `Internal Server Error (dev mode): ${responseBody.message}` 
               : defaultMessage;
         } else {
            userMessage = responseBody.message;
         }
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




// export function isUnauthorizedError(error: unknown): boolean {
//    return (
//       error instanceof AxiosError &&
//       error.response?.status === 401 &&
//       error.response?.data?.code === "SESSION_EXPIRED"
//    );
// }


// export function isSessionExpiredError(error: unknown): boolean {
//    return (
//       error instanceof AxiosError &&
//       error.response?.data?.code === "SESSION_EXPIRED"
//    );
// }



export function shouldSkipToast(error: unknown): boolean {
   if (!(error instanceof AxiosError)) return false;

   const responseBody: ApiResponse<ApiErrorData<string>> = error.response?.data as ApiResponse<ApiErrorData>;

   // const code: string | undefined = (error.response?.data as { code?: string })?.code;
   const code: string | undefined = responseBody?.data?.code;

   return [
      "SESSION_EXPIRED",
   ].includes(code || "");
}




// frontend/src/types/apiError.types.ts
export type ServerZodError<TFields extends string = string> = {
   field    : TFields;
   message  : string;
};


// Represents the shape of response.data.data when an error occurs
export interface ApiErrorData<TFields extends string = string> {
   code?    : string;
   stack?   : string;
   details? : ServerZodError<TFields>[];
}



// Exactly how Axios wraps the Common Response Model
export type ApiAxiosError<TFields extends string = string> = {
   response?: {
      data?: ApiResponse<ApiErrorData<TFields>>;
   };
};





// frontend/src/utils/applyServerZodErrors.ts
import { type UseFormSetError, type FieldValues, type Path } from "react-hook-form";


export const setServerZodErrors = <T extends FieldValues>(
   error: unknown,
   setError: UseFormSetError<T>
) => {

   const apiError = error as ApiAxiosError;
   const errors = apiError.response?.data?.data?.details;

   if (!errors?.length) return;

   errors.forEach(({ field, message }) => {
      if (typeof field !== "string") return;

      setError(field as Path<T>, {
         type: "server",
         message,
      });
   });
};
