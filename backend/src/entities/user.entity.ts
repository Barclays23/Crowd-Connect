// // backend/src/entities/user.entity.ts

import { UserRole, UserStatus, HostStatus } from "../constants/roles-and-statuses";




// // to update user (by admin)
// export type UpdateUserEntity = Partial<
//   Pick<
//     UserEntity,
//     "name" | "email" | "role" | "status" | "mobile" | "profilePic"
//   >
// >;



// export type UpgradeHostEntity = Partial<
//   Pick<
//     HostEntity,
//     | "organizationName"
//     | "registrationNumber"
//     | "businessAddress"
//     | "hostStatus"
//     | "certificateUrl"
//   >
// >;








// ==============================================================================================



// BaseUserEntity
export interface UserEntity {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  mobile?: string;
  profilePic?: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isSuperAdmin: boolean;
  createdAt?: Date;
}


// for internal auth use (with password)
export interface SensitiveUserEntity extends UserEntity {
  password: string;
}


// ExtendedUserEntity
export interface HostEntity extends UserEntity {
  organizationName: string;
  registrationNumber: string;
  businessAddress: string;
  hostStatus: HostStatus;
  certificateUrl?: string;
  hostRejectionReason?: string;
  appliedAt?: Date;
  reviewedAt?: Date;
}

export interface UserProfileEntity extends HostEntity, UserEntity {}






// ── CRUD Inputs ─────────────────────────────────────


export interface AuthUserCheckInput {
  email: string;
}


export interface SignUpUserInput {
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  status: UserStatus;
  role: UserRole;
  isSuperAdmin: boolean;
}



export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  mobile?: string;
  profilePic?: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
}


export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  mobile?: string;
  profilePic?: string;
}



export interface UpgradeHostInput {
  // organizationName?: string;
  // registrationNumber?: string;
  // businessAddress?: string;
  // certificateUrl?: string;
  // hostStatus?: HostStatus;

  role: UserRole.HOST;  // to upgrade user to host (but hostStatus will be 'pending')

  organizationName: string;
  registrationNumber: string;
  businessAddress: string;
  certificateUrl?: string;
  hostStatus: HostStatus.PENDING;  // 'pending' on upgrade request
}


// for any update of host details by user or admin (allowed to update by user after approval ??)
export interface UpdateHostInput {
  organizationName?: string;
  registrationNumber?: string;
  businessAddress?: string;
  certificateUrl?: string;
  hostStatus?: HostStatus;
}