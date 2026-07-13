// frontend/src/types/user.types.ts
import type { HostStatus, UserRole, UserStatus } from "@/constants/user-system.constants";
import type { IPagination } from "@/types/common.types";


// move to constants
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



export interface UserUpsertResult {
  userId: string;
  name: string;
  email: string;
  mobile?: string;
  role: UserRole;
  status: UserStatus;
  profilePic?: string;
}





// ─── REQUEST PAYLOADS ─────────────────────────────────────────────────────────


export interface GetUsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | "all";
  status?: string;
}

export interface UserBasicInfoPayload {
  name?: string;
  mobile?: string;
  // email?: string;  // separate editing
  // add other profile fields as needed
}


export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface GetHostsQueryParams {
  role?: UserRole;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  hostStatus?: string;
}

export interface ManageHostPayload {
  action: "approve" | "reject";
  reason?: string;
}




// ─── RESPONSE DATA PAYLOADS (The 'T' in ApiResponse<T>) ────────────────────────────────


export interface ProfilePicUpdateData {
  profilePic: string;
}

export interface UserStatusUpdateData {
  status: UserStatus;
}

export interface HostStatusUpdateData {
  hostId: string;
  hostStatus: HostStatus;
  hostReviewedAt?: string;
  hostRejectionReason?: string;
}