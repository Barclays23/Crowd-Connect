// backend/src/dtos/auth.dto.ts


import { UserRole, UserStatus } from "../types/user.types";
import { BaseUserResponseDto } from "./user.dto";




export interface SignUpRequestDto {
    name: string;
    email: string;
    password: string;
}


export interface SignInRequestDto {
    email: string;
    password: string;
}





export interface ResetPasswordDto {
    token: string;
    newPassword: string;
}



// RESPONSE AUTH USER
// export interface AuthUserResponseDto extends BaseUserResponseDto {}
export type AuthUserResponseDto = BaseUserResponseDto;




// API RESPONSE
export interface AuthResponseDto {
    authUser: AuthUserResponseDto;
    accessToken: string;
    message: string;
}