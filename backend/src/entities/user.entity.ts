// backend/src/entities/user.entity.ts

import { HostStatus, UserRole, UserStatus } from "../types/user.types";




export interface UserEntity {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  mobile?: string;
  profilePic?: string;
  // mobile?: string | null;
  // profilePic?: string | null;
  isEmailVerified: boolean;
  isMobileVerified: boolean;

  createdAt?: Date;
}





// for internal auth use (with password)
export interface SensitiveUserEntity extends UserEntity {
  password: string;
}




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




export interface SignUpUserEntity {
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
}



export interface AuthUserCheckEntity {
  email: string;
}



// to create new user (by admin)
export interface CreateUserEntity {
  name: string;
  email: string;
  password: string;
  mobile?: string;
  profilePic?: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
}


// to update user (by admin)
export type UpdateUserEntity = Partial<
  Pick<
    UserEntity,
    "name" | "email" | "role" | "status" | "mobile" | "profilePic"
  >
>;



export type UpgradeHostEntity = Partial<
  Pick<
    HostEntity,
    | "organizationName"
    | "registrationNumber"
    | "businessAddress"
    | "hostStatus"
    | "certificateUrl"
  >
>;