// frontend/src/types/user.types.ts

import type { IPagination } from "@/types/common.types";

export type UserRole = "user" | "host" | "admin";
export type UserStatus = "active" | "blocked" | "pending";
export type HostStatus = "pending" | "approved" | "rejected" | "blocked";


export const MAX_PROFILE_PIC_SIZE = 2 * 1024 * 1024; // 2MB
export const ACCEPTED_PROFILE_PIC_TYPES = ['image/jpg', "image/jpeg", "image/png", 'image/gif', "image/webp"];


export interface UserState {
  userId: string;
  name: string;
  email: string;
  mobile?: string;
  profilePic?: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isSuperAdmin?: boolean;
  walletBalance?: number;

  organizationName?: string | null;
  registrationNumber?: string | null;
  businessAddress?: string | null;
  certificateUrl?: string | null;
  hostAppliedAt?: string | null;
  hostStatus?: HostStatus;
  hostRejectionReason?: string;
  reviewedAt?: string;

  createdAt: string;
}



export interface GetUsersApiResponse {
  usersData: UserState[];
  message: string;
  pagination: IPagination;
}


export interface UserUpsertResult {
  userId: string;
  name: string;
  email: string;
  mobile?: string;
  role: UserRole;
  status: UserStatus;
  profilePic?: string;
}
