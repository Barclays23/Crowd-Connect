import jwt from "jsonwebtoken"; // safer import when using TypeScript
import crypto from "crypto";


interface RefreshTokenPayload extends jwt.JwtPayload {
    userId: string;
    jti: string;
    // Add other properties you rely on
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const ACCESS_TOKEN_EXPIRY = "5m";  // 5 minutes
// const REFRESH_TOKEN_EXPIRY = "7d";  // 7 days  (also check in refreshCookie.utils.ts)
const REFRESH_TOKEN_EXPIRY = "15m";  // 15 minutes (also check in refreshCookie.utils.ts)

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




function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (err) {
    throw new Error("Invalid or expired access token");
  }
}



function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
    console.log('decoded refreshToken:', decoded);
    return decoded;
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }
}



export { createAccessToken, createRefreshToken, verifyAccessToken, verifyRefreshToken };
