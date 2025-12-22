// backend/src/types/user.types.ts

import { UserProfileDto } from "../dtos/user.dto";
import { UserEntity } from "../entities/user.entity";


// query filters for fetching users
export interface GetUsersFilter {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  status?: string;
}


// result when fetching users
export interface GetUsersResult {
  users: UserProfileDto[] | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}