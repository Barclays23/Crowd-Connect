// backend/src/dtos/auth.dto.ts


export type UserRole = 'user' | 'host' | 'admin';

export type UserStatus = 'active' | 'blocked' | 'pending';


export interface SignUpRequestDto {
    name: string;
    email: string;
    password: string;
}


export interface SignInRequestDto {
    email: string;
    password: string;
}


// RESPONSE AUTH USER
export interface AuthUserDto {
    userId: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    // mobile?: string;
    profilePic?: string;
    isEmailVerified: boolean;
}





// API RESPONSE
export interface AuthResponseDto {
    authUser: AuthUserDto;
    accessToken: string;
    message: string;
}