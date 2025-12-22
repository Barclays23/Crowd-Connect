// frontend/src/types/auth.types.ts

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  role: "user" | "host" | "admin";
  status: "active" | "blocked";
  mobile?: string;
//   isEmailVerified?: boolean;
//   joinedAt: string; // createdAt ISO string
}



export interface AuthState {
    user: AuthUser | null;
    accessToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
}


export interface AuthResponse {   // replace this AuthResponse with AuthResponseDTO ??
  accessToken?: string;
  user?: AuthUser;
  message?: string;
  // add other fields your backend returns if any
}