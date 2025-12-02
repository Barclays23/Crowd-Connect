import { IUser } from "@shared/types";
import { AuthResponseDto, SignUpRequestDto } from "../../dtos/auth.dto";



export interface IAuthService {
    signIn(email: string, password: string): Promise<AuthResponseDto>
    signUp(user: SignUpRequestDto): Promise<string>
    verifyOtp(email: string, otp: string): Promise<AuthResponseDto>;
    resendOtp(email: string): Promise<string>
    refreshAccessToken(refreshToken: string): Promise<string>
}