// backend/src/dtos/user.dto.ts
import { HostStatus, UserRole, UserStatus } from "../constants/roles-and-statuses";



// HTTP Request boundary ------------------------------------------------------------------------

// for creating a new user by admin
export interface CreateUserRequestDto {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  mobile?: string;
  // profileImage?: Express.Multer.File;
}


// for updating user (by admin)
export interface UpdateUserRequestDto {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  mobile?: string;
  // profileImage?: Express.Multer.File;
}


export interface HostUpgradeRequestDto {
  organizationName: string;
  registrationNumber: string;
  businessAddress: string;
  // hostDocument: Express.Multer.File;
}





// Response boundary --------------------------------------------------------------------

export interface BaseUserResponseDto {
  userId: string;
  name: string;
  email: string;

  mobile?: string;
  profilePic?: string;

  role: UserRole;
  status: UserStatus;

  isEmailVerified: boolean;
  isMobileVerified?: boolean;
  isSuperAdmin: boolean;
  createdAt?: string | null;
}



// if role === 'host'
export interface HostResponseDto {
  organizationName?: string | null;
  registrationNumber?: string | null;
  businessAddress?: string | null;
  certificateUrl?: string | null;
  hostStatus?: HostStatus;
  hostAppliedAt?: string | null;
  hostRejectionReason?: string;
  appliedAt?: string | null;
  reviewedAt?: string | null;
}



// for user/host profile page, host event page, host listing etc
// export interface UserProfileDto extends BaseUserResponseDto, HostResponseDto {}
export type UserProfileResponseDto = BaseUserResponseDto & HostResponseDto;






