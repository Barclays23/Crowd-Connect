// frontend/src/services/authServices.ts

import axiosInstance from "@/config/axios";
import type { AxiosError } from "axios";



interface AuthFormData {
  name?: string;
  email: string;
  mobile?: string;
  password: string;
  confirmPassword?: string;
  agreeTerms?: boolean;
}



export const authService = {

    registerService: async (data: AuthFormData) => {
        try {
            // console.log('data received in registerService :', data)
            const response = await axiosInstance.post("/api/auth/register", data, { withCredentials: true });
            // return { data: response.data, error: null };
            return response.data;

        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            // console.log('err in registerService:', err);
            // const errorMessage = err.response?.data?.error || "Registration Failed. Please Try Again.";
            // toast.error(errorMessage)
            
            // Option 1: Throw clean message
            // throw new Error(errorMessage);

            // Option 2: Re-throw original (best for debugging)
            throw err;
        }
    },


    loginService: async (data: AuthFormData) => {
        try {
            // console.log('data received in loginService :', data)
            const response = await axiosInstance.post("/api/auth/login", data, { withCredentials: true });
            // return { data: response.data, error: null };
            return response.data;

        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            // console.log('err in loginService:', err);
            // const errorMessage = err.response?.data?.error || "Loging Failed. Please Try Again.";
            // toast.error(errorMessage)
            
            // Option 1: Throw clean message
            // throw new Error(errorMessage);

            // Option 2: Re-throw original (best for debugging)
            throw err;
        }
    },


    requestFogotPassword: async (email: string) => {
        try {
            console.log('email received in requestFogotPassword :', email);
            const response = await axiosInstance.post("/api/auth/forgot-password", { email }, { withCredentials: true });
            return response.data;
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },


    validateResetLink: async (token: string) => {
        try {
            console.log('token received in validateResetLink :', token);
            const response = await axiosInstance.get(`/api/auth/reset-password/validate/${token}`, { withCredentials: true });
            return response.data;
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },


    resetPasswordService: async ({ token, newPassword, confirmPassword }: { token: string; newPassword: string; confirmPassword: string })=> {
        try {
            console.log('email received in resetPasswordService :', token, newPassword, confirmPassword);
            const response = await axiosInstance.post("/api/auth/reset-password", { token, newPassword, confirmPassword }, { withCredentials: true });
            return response.data;
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },



    verifyOtpService: async (data: { otpCode: string; email: string }) => {
        try {
            console.log('data received in verifyOtpService :', data);
            const response = await axiosInstance.post("/api/auth/verify-otp", data, { withCredentials: true });
            return response.data;
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },



    resendOtpService: async (data: { email: string }) => {
        try {
            const response = await axiosInstance.post("/api/auth/resend-otp", data, { withCredentials: true }); 
            return response.data;
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },



    getAuthUser: async () => {
        try {
            const response = await axiosInstance.get("/api/auth/me", { withCredentials: true });
            return response.data;;
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },


    refreshTokenService: async () => {
        try {
            const response = await axiosInstance.post("/api/auth/refresh-token", {}, { withCredentials: true });
            return response.data;
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    },



    logoutService: async () => {
        try {
            const response = await axiosInstance.post("/api/auth/logout", {}, { withCredentials: true });
            return response.data;
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            throw err;
        }
    }

};