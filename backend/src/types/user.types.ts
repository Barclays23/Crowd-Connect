// backend/src/types/user.types.ts

import { IUser } from "../models/implementations/user.model.js";
import { UserProfileResponseDto } from "../dtos/user.dto.js";
import { HostStatus, UserRole, UserStatus } from "src/constants/roles-and-statuses.js";


export type UserFilterQuery = Partial<IUser> & Record<string, unknown>;



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