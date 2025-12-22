// backend/src/entities/user.entity.ts
interface UserRoleEntity {
  role: "user" | "host" | "admin";
}

interface UserStatusEntity {
  status: "active" | "blocked" | "pending";
}




export interface UserEntity {
  id: string;
  name: string;
  email: string;
  role: "user" | "host" | "admin";
  status: "active" | "blocked" | "pending";
  mobile?: string;
  profilePic?: string;
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
export interface CreateUserEntity extends UserRoleEntity, UserStatusEntity {
  name: string;
  email: string;
  password: string;
  mobile?: string;
  profilePic?: string;
  // role: "user" | "host" | "admin";    // UserRoleEntity
  // status: "active" | "blocked" | "pending";   // UserStatusEntity
  isEmailVerified: boolean;
  isMobileVerified: boolean;
}
