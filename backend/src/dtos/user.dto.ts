// backend/src/dtos/user.dto.ts

export type UserRole = 'user' | 'host' | 'admin';
export type UserStatus = 'active' | 'blocked';



export interface UserDto {  // not included host details (organisationName, address, certificates etc)
  userId: string;   // The public ID (e.g., MongoDB ObjectId converted to string)
  name: string;
  email: string;
  role: UserRole;
  mobile?: string | null;
  profilePic?: string | null;
  status: UserStatus;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  createdAt: string;                // ISO string
  // updatedAt: string;                // ISO string
}


export interface HostDto extends UserDto {
  // Host-specific fields (only present if role === 'host')
  organizationName?: string | null;
  registrationNumber?: string | null;
  businessAddress?: string | null;
  certificate?: string | null;
}



// query filters when fetching users
export interface GetUsersFilter {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  status?: string;
}


// result when fetching users
export interface GetUsersResult {
  users: UserDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}