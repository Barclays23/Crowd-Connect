// backend/src/types/user.types.ts

import { UserProfileResponseDto } from "../dtos/user.dto";


export type UserRole = 'user' | 'host' | 'admin';

export type UserStatus = 'active' | 'blocked' | 'pending';

export type HostStatus = 'pending' | 'approved' | 'rejected' | 'blocked';




// query filters for fetching users (by admin)
export interface GetUsersFilter {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  status?: string;
}


// result when fetching users (by admin)
export interface GetUsersResult {
  users: UserProfileResponseDto[] | null;  // UserEntity[] | null; ??
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}