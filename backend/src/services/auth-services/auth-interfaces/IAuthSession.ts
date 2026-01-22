// backend/src/services/interfaces/IAuthServices.ts
import { AuthResult } from "../../../types/auth.types";
import { 
    AuthUserResponseDto, 
    SignInRequestDto, 
} from "../../../dtos/auth.dto";



export interface IAuthSessionService {
    signIn(signInDto: SignInRequestDto): Promise<AuthResult>

    refreshAccessToken(refreshToken: string): Promise<string>
    revokeRefreshToken(refreshToken: string): Promise<void>

    getAuthUser(userId: string): Promise<AuthUserResponseDto>
}