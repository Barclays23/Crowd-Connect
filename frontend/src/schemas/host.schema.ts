// frontend/src/schemas/host.schema.ts
import { z } from "zod";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB


const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];


/* ---------- Base Fields ---------- */
export const organizationNameBase = z
   .string()
   .trim()
   .min(1, "Organization name is required")
   .min(5, "Organization name must be at least 5 characters long")
   .max(50, "Organization name cannot exceed 50 characters")
   .regex(
      /^[A-Za-z0-9\s&.,'\-()]+$/,
      "Organization name can contain only letters, numbers, spaces, and basic punctuation (&.,'-)"
   );



export const registrationNumberBase = z
   .string()
   .trim()
   .min(1, "Registration number is required")
   .min(3, "Registration number must be at least 3 characters")
   .max(25, "Registration number is too long")
   .regex(
      /^[a-zA-Z0-9\s\-./]+$/,
      "Only letters, numbers, spaces, hyphens, dots and slashes are allowed"
   )
   .refine(
      (val) => /\d/.test(val),
      "Looks like numbers are missing from the registration number."
   );


export const businessAddressBase = z
   .string()
   .trim()
   .min(1, "Business address is required")
   .min(30, "Include street name, city, etc (at least 30 characters)")
   .max(100, "Address too long. Address should not exceed 100 characters")
   .refine(
      (val) => !/^\d+$/.test(val),
      "Address cannot contain only numbers (please include street name, city, etc.)"
   );



export const hostDocumentBase = z
   .instanceof(File, {
      message: "Business document/certificate is required",
   })
   // .optional()
   .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `Certificate must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
   )
   .refine(
      (file) => !file || ALLOWED_FILE_TYPES.includes(file.type),
      "Certificate must be a PDF, JPG, or PNG file"
   );


export const rejectReasonBase = z
   .string()
   .trim()
   .min(1, "Rejection reason is required")
   .min(10, "Rejection reason must be at least 10 characters")
   .max(250, "Rejection reason cannot exceed 250 characters");




export const HostRejectSchema = z.object({
   reason: rejectReasonBase
});





export const HostUpgradeSchema = z.object({
   organizationName: organizationNameBase,
   registrationNumber: registrationNumberBase,
   businessAddress: businessAddressBase,
   hostDocument: hostDocumentBase,
});




export type HostUpgradeFormData = z.infer<typeof HostUpgradeSchema>;
export type HostUpdateFormData = z.infer<typeof HostUpgradeSchema>;
export type HostRejectFormData = z.infer<typeof HostRejectSchema>;
