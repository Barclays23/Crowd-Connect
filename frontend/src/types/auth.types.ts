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
  user            : UserState | null;
  accessToken     : string | null
  isAuthenticated : boolean
  isLoading       : boolean
}


/**
 * Defines the shape of React Router's location state object.
 * Primarily used during authentication flows to remember the user's previous path
 * for post-login redirection, and to trigger specific UI modals upon arrival.
 * Used to capture the referring URL (to return users to their original page after logging in)
 */
export type RouterLocationState = {
  from? : {
    pathname  : string; // The path (e.g., /settings/profile)
    search    : string; // The query string (e.g., ?tab=info)
    hash      : string; // The fragment identifier (e.g., #details)
  };
  openForgotPassword? : boolean;
  openBooking?        : boolean;
};


// export interface AuthResponse {   // replace this AuthResponse with AuthResponseDTO ??
//   accessToken?: string;
//   user?: UserState;
//   message?: string;
// }