// frontend/src/services/authServices.ts

import axiosInstance from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints.constants";
import type { 
    AuthEmailRequestData,
    AuthTokensData,
    AuthUserData,
    EmailResponseData,
    LoginPayload, 
    RefreshTokenData, 
    RegisterPayload, 
    ResetPasswordPayload, 
    TokenValidationData
} from "@/types/auth.types";
import type { ApiResponse } from "@/types/common.types";



export const authService = {

    registerService: async (data: RegisterPayload): Promise<ApiResponse<EmailResponseData>> => {
        const response = await axiosInstance.post<ApiResponse<EmailResponseData>>(
            API_ENDPOINTS.AUTH.REGISTER,
            data,
            { withCredentials: true }
        );
        return response.data;
    },


    loginService: async (data: LoginPayload): Promise<ApiResponse<AuthTokensData>> => {
        const response = await axiosInstance.post<ApiResponse<AuthTokensData>>(
            API_ENDPOINTS.AUTH.LOGIN,
            data, 
            { withCredentials: true }
        );
        return response.data;
    },


    requestFogotPassword: async (email: string): Promise<ApiResponse<EmailResponseData>> => {
        const response = await axiosInstance.post<ApiResponse<EmailResponseData>>(
            API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
            { email },
            { withCredentials: true }
        );
        return response.data;
    },


    validateResetLink: async (token: string): Promise<ApiResponse<TokenValidationData>> => {
        const response = await axiosInstance.get<ApiResponse<TokenValidationData>>(
            API_ENDPOINTS.AUTH.VALIDATE_RESET_LINK(token),
            { withCredentials: true }
        );
        return response.data;
    },


    resetPasswordService: async (data: ResetPasswordPayload): Promise<ApiResponse<void>> => {
        const response = await axiosInstance.post<ApiResponse<void>>(
            API_ENDPOINTS.AUTH.RESET_PASSWORD,
            data, 
            { withCredentials: true }
        );
        return response.data;
    },


    // only for email verification (when changing email or if not already verified)
    requestAuthenticateEmail: async ({ email }: { email: string }): Promise<ApiResponse<AuthEmailRequestData>> => {
        const response = await axiosInstance.post<ApiResponse<AuthEmailRequestData>>(
            API_ENDPOINTS.AUTH.AUTHENTICATE_EMAIL,
            { email }, 
            { withCredentials: true }

        );
        return response.data;
    },


    // only for email verification (when changing email or if not already verified)
    verifyEmailService: async (data: {otpCode: string, email: string}): Promise<ApiResponse<EmailResponseData>> => {
        const response = await axiosInstance.post<ApiResponse<EmailResponseData>>(
            API_ENDPOINTS.AUTH.VERIFY_EMAIL,
            data, 
            { withCredentials: true }
        );
        return response.data;
    },


    // for verifying account during registration
    verifyAccountService: async (data: { otpCode: string; email: string }): Promise<ApiResponse<AuthTokensData>> => {
        const response = await axiosInstance.post<ApiResponse<AuthTokensData>>(
            API_ENDPOINTS.AUTH.VERIFY_ACCOUNT,
            data, 
            { withCredentials: true }
        );
        return response.data;
    },



    resendOtpService: async (data: { email: string }): Promise<ApiResponse<EmailResponseData>> => {
        const response = await axiosInstance.post<ApiResponse<EmailResponseData>>(
            API_ENDPOINTS.AUTH.RESEND_OTP,
            data, 
            { withCredentials: true }
        ); 
        return response.data;
    },
    


    getAuthUser: async (): Promise<ApiResponse<AuthUserData>> => {
        const response = await axiosInstance.get<ApiResponse<AuthUserData>>(
            API_ENDPOINTS.AUTH.ME,
            { withCredentials: true }
        );
        return response.data;
    },


    refreshTokenService: async (): Promise<ApiResponse<RefreshTokenData>> => {
        const response = await axiosInstance.post<ApiResponse<RefreshTokenData>>(
            API_ENDPOINTS.AUTH.REFRESH_TOKEN,
            {}, 
            { withCredentials: true }
        );
        return response.data;
    },


    logoutService: async (): Promise<ApiResponse<void>> => {
        const response = await axiosInstance.post<ApiResponse<void>>(
            API_ENDPOINTS.AUTH.LOGOUT,
            {}, 
            { withCredentials: true }
        );
        return response.data;
    },



};