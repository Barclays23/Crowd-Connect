// backend/src/types/user.types.ts

import { IUserModel } from "@/models/implementations/user.model";
import { UserProfileResponseDto } from "@/dtos/user.dto";
import { HostStatus, UserRole, UserStatus } from "@/constants/roles-and-statuses";


export type UserFilterQuery = Partial<IUserModel> & Record<string, unknown>;



// query filters for fetching users (by admin)
export interface GetUsersFilter {
  page: number;
  limit: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}




export interface GetHostsFilter {
  page: number;
  limit: number;
  role?: UserRole;
  status?: UserStatus;
  hostStatus?: HostStatus;
  search?: string;
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