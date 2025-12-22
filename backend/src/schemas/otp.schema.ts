// backend/src/schemas/otp.schema.ts
import { z } from "zod";


export const OtpSchema = z.object({
  email: z
    .string()
    .email({ message: "Valid email is required." }),
  otpCode: z
    .string()
    .length(6, { message: "OTP must be exactly 6 digits." })
    .regex(/^\d+$/, { message: "OTP must contain only numbers." })
});