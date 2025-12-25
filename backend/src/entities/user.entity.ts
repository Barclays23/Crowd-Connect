// backend/src/entities/user.entity.ts

export type UserRole = "user" | "host" | "admin";
export type UserStatus = "active" | "blocked" | "pending";


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
  organisationName?: string;
  address?: string;
  // certificates?: string[];
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
