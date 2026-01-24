// frontend/src/types/auth.types.ts

import type { UserState } from "./user.types";




export interface LoginPayload {
  email: string;
  password: string;
}


export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}



export interface LoginResponse {
  authUser: UserState;
  accessToken: string;
  message: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface LogoutResponse {
  message: string;
}




export interface AuthState {
  user: UserState | null;
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}


// export interface AuthResponse {   // replace this AuthResponse with AuthResponseDTO ??
//   accessToken?: string;
//   user?: UserState;
//   message?: string;
// }