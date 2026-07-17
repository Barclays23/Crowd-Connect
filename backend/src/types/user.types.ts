// backend/src/types/user.types.ts
import { UserProfileResponseDto } from "@/dtos/user.dto";
import { HostStatus, UserRole, UserStatus } from "@/constants/user-system.constants";
import { Types } from "mongoose";
import { IPagination } from "@/types/common.types";




export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google'
}



export interface IUserModel {
  _id: Types.ObjectId | string;

  name          : string;
  email         : string;
  mobile        : string;
  profilePic?   : string;
  password?     : string;  // optional for google auth user
  authProvider  : AuthProvider;
  googleId?     : string;

  walletBalance : number;

  isEmailVerified   : boolean;
  isMobileVerified  : boolean;

  role        : UserRole;
  status      : UserStatus;      // ( "inactive" or "pending" if admin creates user and verify/login later)
  isSuperAdmin: boolean;

  // Host application fields
  organizationName?   : string;
  registrationNumber? : string;
  businessAddress?    : string;
  certificateUrl?     : string;
  hostStatus?         : HostStatus;
  hostAppliedAt?      : Date;
  hostReviewedAt?     : Date;
  hostReviewedBy?     : Types.ObjectId;
  hostRejectionReason?: string;
  ratingAverage?      : number;
  totalReviews?       : number;

  createdAt : Date;
  updatedAt : Date;
}



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






// ─── REQUEST PAYLOADS ─────────────────────────────────────────────────────────

export interface GetHostsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  hostStatus?: string;
}

export interface ManageHostPayload {
  action: "approve" | "reject" | "block";
  reason?: string;
}





// ─── RESPONSE DATA PAYLOADS (The 'T' in ApiResponse<T>) ────────────────────────────────

// result when fetching users (by admin)
export interface GetUsersResult {
  users: UserProfileResponseDto[] | null;
  // page: number;
  // limit: number;
  // total: number;
  // totalPages: number;
  pagination: IPagination;
}


// result when fetching hosts (by admin)
export interface GetHostsResult {
  hosts: UserProfileResponseDto[] | null;
  // page: number;
  // limit: number;
  // total: number;
  // totalPages: number;
  pagination: IPagination;
}


export interface HostStatusUpdateData {
  hostId: string;
  hostStatus: HostStatus;
  hostReviewedAt?: string;
  hostRejectionReason?: string;
}
