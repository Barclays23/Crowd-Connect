// backend/src/types/auth.types.ts

import { AuthUserResponseDto } from "src/dtos/auth.dto.js";
import { UserEntity } from "../entities/user.entity.js";



export interface AuthSignUpResult {  // for signUp
    email: string;
}


export interface AuthResult {  // (for both signIn and verifyOtp)
//   verifiedUser: UserEntity;
  safeUser: AuthUserResponseDto;
  accessToken: string;
  refreshToken: string;
}