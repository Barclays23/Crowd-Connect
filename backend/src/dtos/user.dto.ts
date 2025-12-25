// backend/src/dtos/user.dto.ts

export type UserRole = 'user' | 'host' | 'admin';
export type UserStatus = 'active' | 'blocked' | 'pending';



// HTTP boundary ------------------------------------------------------------------------

// for creating a new user (admin creating user)
export interface CreateUserDTO {  // CreateUserRequestDto
  name: string;
  email: string;
  role: "user" | "host" | "admin";
  status: "active" | "blocked" | "pending";

  mobile?: string;
  profileImage?: Express.Multer.File;
}


// for updating user (by admin)
export interface UpdateUserDTO {   // UpdateUserRequestDto
  name?: string;
  email?: string;
  role?: "user" | "host" | "admin";
  status?: "active" | "blocked" | "pending";
  mobile?: string;
  // profileImage?: Express.Multer.File;
}





// Response boundary --------------------------------------------------------------------

// or UserProfileResponseDto
export interface UserProfileDto {  // not included host fields
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  mobile?: string | null;
  profilePic?: string | null;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  createdAt: string | null;
}



// if role === 'host'
export interface HostDto extends UserProfileDto {
  organizationName?: string | null;
  registrationNumber?: string | null;
  businessAddress?: string | null;
  certificate?: string | null;
}






// // for creating a new user (admin creating user)
// export interface CreateUserDTO {
//   name: string;
//   email: string;
//   // password: string;   // password will be generated and sent via email
//   role: UserRole;
//   status: "active" | "blocked" | "pending";  // UserStatus
//   mobile?: string;
//   profilePic?: string;
// }



// // for updating user (by admin)
// export interface UpdateUserDTO {
//   name?: string;
//   email?: string;          // optional (you may restrict later)
//   role?: UserRole;
//   status?: UserStatus;
//   mobile?: string | null;
//   profilePic?: string | null;
// }



