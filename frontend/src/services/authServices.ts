// frontend/src/services/authServices.ts

import axiosInstance from "@/config/axios";
import type { 
    LoginPayload, 
    LoginResponse, 
    LogoutResponse, 
    RegisterPayload, 
    RegisterResponse 
} from "@/types/auth.types";



export const authService = {

    registerService: async (data: RegisterPayload): Promise<RegisterResponse> => {
        const response = await axiosInstance.post("/api/auth/register", data, { withCredentials: true });
        return response.data;
    },


    loginService: async (data: LoginPayload): Promise<LoginResponse> => {
        const response = await axiosInstance.post("/api/auth/login", data, { withCredentials: true });
        return response.data;
    },


    requestFogotPassword: async (email: string) => {
        const response = await axiosInstance.post("/api/auth/forgot-password", { email }, { withCredentials: true });
        return response.data;
    },


    validateResetLink: async (token: string) => {
        const response = await axiosInstance.get(`/api/auth/reset-password/validate/${token}`, { withCredentials: true });
        return response.data;
    },


    resetPasswordService: async ({ token, newPassword, confirmPassword }: { token: string; newPassword: string; confirmPassword: string })=> {
        const response = await axiosInstance.post("/api/auth/reset-password", { token, newPassword, confirmPassword }, { withCredentials: true });
        return response.data;
    },



    // only for email verification (when changing email or if not already verified)
    requestAuthenticateEmail: async ({ email }: { email: string }) => {
        const response = await axiosInstance.post("/api/auth/authenticate-email", { email }, { withCredentials: true });
        return response.data;
    },


    // only for email verification (when changing email or if not already verified)
    verifyEmailService: async ({otpCode, email}: {otpCode: string, email: string}) => {
        const response = await axiosInstance.post("/api/auth/verify-email", {otpCode, email}, { withCredentials: true });
        return response.data;
    },



    // for verifying account during registration
    verifyAccountService: async (data: { otpCode: string; email: string }) => {
        const response = await axiosInstance.post("/api/auth/verify-account", data, { withCredentials: true });
        return response.data;
    },



    resendOtpService: async (data: { email: string }) => {
        const response = await axiosInstance.post("/api/auth/resend-otp", data, { withCredentials: true }); 
        return response.data;
    },



    getAuthUser: async () => {
        const response = await axiosInstance.get("/api/auth/me", { withCredentials: true });
        return response.data;
    },


    refreshTokenService: async () => {
        const response = await axiosInstance.post("/api/auth/refresh-token", {}, { withCredentials: true });
        return response.data;
    },



    logoutService: async (): Promise<LogoutResponse> => {
        const response = await axiosInstance.post("/api/auth/logout", {}, { withCredentials: true });
        return response.data;
    }

};