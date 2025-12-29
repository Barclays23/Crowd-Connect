// backend/src/dtos/user.dto.ts
import { HostStatus, UserRole, UserStatus } from "../types/user.types";



// HTTP boundary ------------------------------------------------------------------------

// for creating a new user (admin creating user)
export interface CreateUserDTO {  // CreateUserRequestDto
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;

  mobile?: string;
  profileImage?: Express.Multer.File;
}


// for updating user (by admin)
export interface UpdateUserDTO {   // UpdateUserRequestDto
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  mobile?: string;
  // profileImage?: Express.Multer.File;
}


export interface HostUpgradeDTO {
  organizationName: string;
  registrationNumber: string;
  businessAddress: string;
  // hostDocument: Express.Multer.File;
}





// Response boundary --------------------------------------------------------------------

export interface BaseUserDto {
  userId: string;
  name: string;
  email: string;

  mobile?: string;
  profilePic?: string;

  role: UserRole;
  status: UserStatus;

  isEmailVerified: boolean;
  isMobileVerified?: boolean;
  createdAt?: string | null;
}



// if role === 'host'
export interface HostDto {
  organizationName?: string | null;
  registrationNumber?: string | null;
  businessAddress?: string | null;
  certificateUrl?: string | null;
  hostStatus?: HostStatus;
  hostRejectionReason?: string;
  appliedAt?: string | null;
  reviewedAt?: string | null;
}




// or UserProfileResponseDto (for user/host profile page, host event page, host listing etc)
export interface UserProfileDto extends BaseUserDto, HostDto {}





