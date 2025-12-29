// backend/src/dtos/auth.dto.ts


import { UserRole, UserStatus } from "../types/user.types";
import { BaseUserDto } from "./user.dto";




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
export interface AuthUserDto extends BaseUserDto {}





// API RESPONSE
export interface AuthResponseDto {
    authUser: AuthUserDto;
    accessToken: string;
    message: string;
}