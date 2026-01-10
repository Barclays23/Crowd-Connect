// backend/src/services/interfaces/IAuthServices.ts
import { AuthResult } from "../../types/auth.types";
import { 
    AuthResponseDto, 
    SignUpRequestDto, 
    AuthUserResponseDto, 
    SignInRequestDto, 
    ResetPasswordDto 
} from "../../dtos/auth.dto";



export interface IAuthService {
    signIn(signInDto: SignInRequestDto): Promise<AuthResult>
    signUp(signUpDto: SignUpRequestDto): Promise<string>

    verifyAccount(email: string, otp: string): Promise<AuthResult>
    resendOtp(email: string): Promise<string>
    
    requestPasswordReset(email: string):Promise<string>
    validateResetLink(token: string): Promise<boolean>
    resetPassword({token, newPassword}: ResetPasswordDto):Promise<string>
    
    requestVerifyEmail(userId: string): Promise<string>
    verifyEmail(email: string, otp: string): Promise<string>

    refreshAccessToken(refreshToken: string): Promise<string>
    revokeRefreshToken(refreshToken: string): Promise<void>

    getAuthUser(userId: string): Promise<AuthUserResponseDto>
}