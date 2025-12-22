// backend/src/dtos/user.dto.ts

export type UserRole = 'user' | 'host' | 'admin';
export type UserStatus = 'active' | 'blocked' | 'pending';



export interface UserProfileDto {  // not included host details (organisationName, address, certificates etc)
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  mobile?: string | null;
  profilePic?: string | null;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  createdAt: string | null;
}



// if role === 'host'
export interface HostDto extends UserProfileDto {
  organizationName?: string | null;
  registrationNumber?: string | null;
  businessAddress?: string | null;
  certificate?: string | null;
}






// for creating a new user (admin creating user)
export interface CreateUserDTO {
  name: string;
  email: string;
  // password: string;   // password will be generated and sent via email
  role: UserRole;
  status: "active" | "blocked" | "pending";  // UserStatus
  mobile?: string;
  profilePic?: string;
}