// backend/src/schemas/auth.schema.ts (for login & register by user)
import { z } from "zod";


export const nameBase = z
  .string()
  .trim()
  .min(1, "Full name is required")
  .min(3, "Full name should be at least 3 characters")
  .max(20, "Full name cannot exceed 20 characters");


export const emailBase = z
  .string()
  .email("Invalid email address");



export const passwordBase = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(20, "Password cannot exceed 20 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");



export const agreeTermsBase = z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms and Conditions.",
  });



export const tokenBase = z
  .string()
  .trim()
  .regex(
    /^[0-9a-f]{32}$/,
    // "Invalid reset token format (must be 32 lowercase hex characters)"
    "Reset link doesn't seem to be valid anymore."
  );






// Login Schema
export const LoginSchema = z.object({
  email: emailBase,
  password: passwordBase,
});



// Register Schema
export const RegisterSchema = z
  .object({
    name: nameBase,
    email: emailBase,
    password: passwordBase,
    confirmPassword: z.string(),
    agreeTerms: agreeTermsBase,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  })




export const ForgotPasswordSchema = z.object({
  email: emailBase,
})


export const ResetLinkSchema = z.object({
  token: tokenBase,
})


export const ResetPasswordSchema = z
  .object({
    token: tokenBase,
    newPassword: passwordBase,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });