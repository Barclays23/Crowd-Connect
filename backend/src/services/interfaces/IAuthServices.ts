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

    requestPasswordReset(email: string):Promise<string>
    resetPassword({token, newPassword}: ResetPasswordDto):Promise<string>
    validateResetLink(token: string): Promise<boolean>

    verifyOtp(email: string, otp: string): Promise<AuthResult>
    resendOtp(email: string): Promise<string>

    refreshAccessToken(refreshToken: string): Promise<string>
    revokeRefreshToken(refreshToken: string): Promise<void>

    getAuthUser(userId: string): Promise<AuthUserResponseDto>
}