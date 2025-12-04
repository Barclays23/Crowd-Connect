import { IUser } from "@shared/types";
import { AuthResponseDto, SignUpRequestDto, UserDto } from "../../dtos/auth.dto";



export interface IAuthService {
    signIn(email: string, password: string): Promise<AuthResponseDto>
    signUp(user: SignUpRequestDto): Promise<string>
    verifyOtp(email: string, otp: string): Promise<AuthResponseDto>;
    resendOtp(email: string): Promise<string>
    refreshAccessToken(refreshToken: string): Promise<string>
    revokeRefreshToken(refreshToken: string): Promise<void>
    getAuthUser(userId: string): Promise<UserDto>
    // updateProfile(user: UserDto): Promise<string>
}