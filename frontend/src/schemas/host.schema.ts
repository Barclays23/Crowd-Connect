// frontend/src/schemas/host.schema.ts
import { agreeTermsBase } from "@/schemas/event.schema";
import { z } from "zod";


// move to constants
export const MAX_FILE_SIZE       = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE   = 5 * 1024 * 1024; // 5MB
export const MAX_LOGO_SIZE       = 2 * 1024 * 1024; // 2MB


// move to constants
export const ALLOWED_DOCUMENT_TYPES = [
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
   // prevent symbol spam at the start
   .refine(
      (value) => !/^[^A-Za-z0-9]{3,}/.test(value), "Organization name cannot start with excessive special characters",
   )
   .regex(
      /^[A-Za-z0-9\s&.,'\-()]+$/,
      "Organization name can contain only letters, numbers, spaces, and basic punctuation (&.,'-)"
   )
   .regex(
      /\b[A-Za-z]{3,}\b/,
      "Organization name must contain meaningful words"
   )
   // limit special characters
   .refine((value) => {
      const total = value.length;
      const specialCount = (value.match(/[^A-Za-z0-9\s.,'()-]/g) || []).length;
      return specialCount / total <= 0.3; // 30%
   }, {
      message: "Organization name contains too many special characters"
   });



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
   .max(150, "Address too long. Address should not exceed 150 characters")
   .refine(
      (val) => !/^\d+$/.test(val),
      "Address cannot contain only numbers (please include street name, city, etc.)"
   );




export const organizationDescriptionBase = z
   .string()
   .trim()
   .min(1, "Organization description is required")
   .min(50, "Description must be at least 50 characters to give attendees a good idea of who you are")
   .max(500, "Description cannot exceed 500 characters");

export const logoBase = z
   .instanceof(File, { message: "Organization logo is required" })
   .optional() // Optional for re-applying so they don't have to re-upload if they just want to change text
   .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `Logo must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
   )
   .refine(
      (file) => !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Logo must be a JPG, PNG, or WEBP image"
   );





/* ---------- Optional File Bases (For Re-Applying / Updating) ---------- */
export const logoBaseOptional = z
   .instanceof(File, { message: "Organization logo is required" })
   .optional()
   .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Logo must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
   .refine((file) => !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Logo must be a JPG, PNG, or WEBP image");


export const hostDocumentBaseOptional = z
   .instanceof(File, { message: "Business document/certificate is required" })
   .optional()
   .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Certificate must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
   .refine((file) => !file || ALLOWED_DOCUMENT_TYPES.includes(file.type), "Certificate must be a PDF, JPG, or PNG file");





   /* ---------- Required File Bases (For Initial Application) ---------- */
export const logoBaseRequired = z
   .instanceof(File, { message: "Organization logo is strictly required for new applications" })
   .refine((file) => file.size <= MAX_FILE_SIZE, `Logo must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
   .refine((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Logo must be a JPG, PNG, or WEBP image");

export const hostDocumentBaseRequired = z
   .instanceof(File, { message: "Business document/certificate is strictly required for new applications" })
   .refine((file) => file.size <= MAX_FILE_SIZE, `Certificate must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
   .refine((file) => ALLOWED_DOCUMENT_TYPES.includes(file.type), "Certificate must be a PDF, JPG, or PNG file");




export const rejectReasonBase = z
   .string()
   .trim()
   .min(1, "Rejection reason is required")
   .min(10, "Rejection reason must be at least 10 characters")
   .max(250, "Rejection reason cannot exceed 250 characters");



export const HostRejectSchema = z.object({
   reason: rejectReasonBase
});




/* ---------- Final Schemas ---------- */
export const HostApplySchema = z.object({
   organizationName: organizationNameBase,
   registrationNumber: registrationNumberBase,
   businessAddress: businessAddressBase,
   organizationDescription: organizationDescriptionBase,
   hostDocument: hostDocumentBaseRequired, // Strict
   organizationLogo: logoBaseRequired, // Strict
   agreeTerms: agreeTermsBase,
});

export const HostReapplySchema = z.object({
   organizationName: organizationNameBase,
   registrationNumber: registrationNumberBase,
   businessAddress: businessAddressBase,
   organizationDescription: organizationDescriptionBase,
   hostDocument: hostDocumentBaseOptional, // Optional
   organizationLogo: logoBaseOptional, // Optional
   agreeTerms: agreeTermsBase,
});








// We export the ReapplySchema as the main Form Data type. 
// This is because React Hook Form needs to allow `undefined` for files in its initial defaultValues state,
// even if the HostApplySchema strictly requires them upon submission.
export type HostUpgradeFormData  = z.infer<typeof HostReapplySchema>;
export type HostUpdateFormData   = z.infer<typeof HostReapplySchema>;
export type HostRejectFormData   = z.infer<typeof HostRejectSchema>;
