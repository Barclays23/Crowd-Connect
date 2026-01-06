// backend/src/types/user.types.ts

import { UserProfileResponseDto } from "../dtos/user.dto";




// query filters for fetching users (by admin)
export interface GetUsersFilter {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface GetHostsFilter {
  page: number;
  limit: number;
  role: string;
  search?: string;
  status?: string;
  hostStatus?: string;
}


// result when fetching users (by admin)
export interface GetUsersResult {
  users: UserProfileResponseDto[] | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}


export interface GetHostsResult {
  hosts: UserProfileResponseDto[] | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}