// backend/src/types/auth.types.ts

import { AuthUserResponseDto } from "src/dtos/auth.dto";
import { UserEntity } from "../entities/user.entity";



export interface AuthSignUpResult {  // for signUp
    email: string;
}


export interface AuthResult {  // (for both signIn and verifyOtp)
//   verifiedUser: UserEntity;
  safeUser: AuthUserResponseDto;
  accessToken: string;
  refreshToken: string;
}