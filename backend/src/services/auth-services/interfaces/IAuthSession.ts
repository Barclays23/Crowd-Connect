// backend/src/services/interfaces/IAuthSession.ts
import { AuthResult } from "@/types/auth.types";
import { 
    AuthUserResponseDto, 
    SignInRequestDto, 
} from "@/dtos/auth.dto";
import { Profile } from "passport-google-oauth20";



export interface IAuthSessionService {
    signIn(signInDto: SignInRequestDto): Promise<AuthResult>
    handleGoogleAuth(googleProfile: Profile): Promise<AuthResult>

    refreshAccessToken(refreshToken: string): Promise<string>
    revokeRefreshToken(refreshToken: string): Promise<void>

    getAuthUser(userId: string): Promise<AuthUserResponseDto>
}