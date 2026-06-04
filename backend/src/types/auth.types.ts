// backend/src/types/auth.types.ts

import { AuthUserResponseDto } from "@/dtos/auth.dto";



export interface AuthSignUpResult {  // for signUp
    email: string;
}


export interface AuthResult {  // (for both signIn and verifyOtp)
//   verifiedUser: UserEntity;
  safeUser: AuthUserResponseDto;
  accessToken: string;
  refreshToken: string;
}