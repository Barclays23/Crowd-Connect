// backend/src/dtos/auth.dto.ts


export type UserRole = 'user' | 'host' | 'admin';

export type UserStatus = 'active' | 'blocked';


export interface SignUpRequestDto {
    name: string;
    email: string;
    password: string;
}


export interface SignInRequestDto {
    email: string;
    password: string;
}


export interface AuthUserDto {
    userId: string; // The public ID (e.g., MongoDB ObjectId converted to string)
    name: string;
    email: string;
    role: UserRole;
    mobile?: string;
    status: UserStatus;
    isEmailVerified: boolean;
}



export interface AuthResponseDto {
    verifiedUser: AuthUserDto;  // user
    accessToken: string;
    refreshToken: string;
    // message: string;
}