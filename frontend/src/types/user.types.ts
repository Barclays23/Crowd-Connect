// frontend/src/types/user.types.ts

export type UserRole = "user" | "host" | "admin";
export type UserStatus = "active" | "blocked" | "pending";
export type HostStatus = "pending" | "approved" | "rejected" | "blocked";




export interface UserState {
  userId: string;
  name: string;
  email: string;
  mobile?: string;
  profilePic?: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  isSuperAdmin?: boolean;

  organizationName?: string | null;
  registrationNumber?: string | null;
  businessAddress?: string | null;
  certificateUrl?: string | null;
  hostAppliedAt?: string | null;
  hostStatus?: HostStatus;
  hostRejectionReason?: string;

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
