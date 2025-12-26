// frontend/src/types/user.types.ts



export interface User {
  userId: string;
  name: string;
  email: string;
  mobile: string;
  role: "admin" | "host" | "user";
  status: "active" | "blocked" | "pending";
  profilePic?: string;
}



export interface UserUpsertResult {
  userId: string;
  name: string;
  email: string;
  mobile?: string;
  role: "admin" | "host" | "user";
  status: "active" | "blocked" | "pending";
  profilePic?: string;
}
