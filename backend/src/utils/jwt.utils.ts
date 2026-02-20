// backend/src/utils/jwt.utils.ts

import jwt from "jsonwebtoken";
const { JsonWebTokenError, TokenExpiredError } = jwt;
import crypto from "crypto";
import 'dotenv/config';
import { createHttpError } from "./httpError.utils";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { HttpResponse } from "@/constants/responseMessages.constants";




interface AccessTokenPayload extends jwt.JwtPayload {
  userId: string;
}


interface RefreshTokenPayload extends jwt.JwtPayload {
    userId: string;
    jti: string;
    // Add other properties you rely on
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const ACCESS_TOKEN_EXPIRY = "15m";  // 5 minutes
// const REFRESH_TOKEN_EXPIRY = "7d";  // 7 days  (also check in refreshCookie.utils.ts)
const REFRESH_TOKEN_EXPIRY = "1d";  // 30 minutes (also check in refreshCookie.utils.ts)

// tell TS these are the types jsonwebtoken expects
// const ACCESS_SECRET: jwt.Secret = ACCESS_TOKEN_SECRET;
// const REFRESH_SECRET: jwt.Secret = REFRESH_TOKEN_SECRET;
// type ExpiresIn = jwt.SignOptions["expiresIn"];



function createAccessToken(payload: object): string {
//   const options: jwt.SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRES_IN as ExpiresIn };
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}



// function createRefreshToken(payload: object): string {
//     return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
// }

function createRefreshToken(payload: object): string {
    // 1. Generate a unique ID (JTI)
    const jti = crypto.randomBytes(16).toString('hex'); 
    
    // 2. Include 'jti' in the payload for server verification
    const tokenPayload = { ...payload, jti }; 
    
    //   const options: jwt.SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRES_IN as ExpiresIn };
  return jwt.sign(tokenPayload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}




function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
  } catch (err) {
    throw new Error("Invalid or expired access token");
  }
}



function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
    // console.log('Decoded refreshToken payload in verifyRefreshToken:', decoded);
    return decoded;

  } catch (err: unknown) {
    console.log('refresh token is expired in jwt (but, may be valid in cookie).');
    console.error('Refresh token verification failed:', err);

    // 🔒 Token expired
    if (err instanceof TokenExpiredError) {
      throw createHttpError(
        HttpStatus.UNAUTHORIZED,
        `${HttpResponse.SESSION_EXPIRED} ${HttpResponse.LOGIN_AGAIN}`,
        "SESSION_EXPIRED"
      );
      // message: "Your session has expired. Please log in again to continue."
      // throwing message to auth.services ➜ auth.controller ➜ axios intercepter
    }


    // 🔒 Invalid / malformed / signature error
    if (err instanceof JsonWebTokenError) {
      throw createHttpError(
        HttpStatus.UNAUTHORIZED,
        `${HttpResponse.SESSION_ENDED} ${HttpResponse.LOGIN_AGAIN}`,
        "SESSION_EXPIRED"
      );
      // message: "Your session has ended. Please log in again to continue."
      // throwing message to auth.services ➜ auth.controller ➜ axios intercepter
    }

    // 🔒 Truly unknown error (very rare)
    throw createHttpError(
      HttpStatus.UNAUTHORIZED,
      `${HttpResponse.SESSION_ENDED} ${HttpResponse.LOGIN_AGAIN}`,
      "SESSION_EXPIRED"
    );
    // message: "Your session has ended. Please log in again to continue."
  }
}



export { createAccessToken, createRefreshToken, verifyAccessToken, verifyRefreshToken };
