// frontend/src/types/auth.types.ts

import type { UserState } from "./user.types";




export interface AuthState {
  user: UserState | null;
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}


export interface AuthResponse {   // replace this AuthResponse with AuthResponseDTO ??
  accessToken?: string;
  user?: UserState;
  message?: string;
}