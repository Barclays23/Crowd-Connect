// frontend/src/schemas/host-upgrade.schema.ts
import { z } from "zod";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB


const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];





export const hostUpgradeSchema = z.object({
   organizationName: z
      .string()
      .trim()
      .min(1, "Organization name is required")
      .min(5, "Organization name must be at least 5 characters")
      .max(50, "Organization name must be less than 50 characters")
      .refine(
         (val) => !/^\d+$/.test(val),
         "Organization name cannot contain only numbers"
      ),


   registrationNumber: z
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
      ),


   businessAddress: z
      .string()
      .trim()
      .min(1, "Business address is required")
      .min(30, "Include street name, city, etc (at least 30 characters)")
      .max(100, "Address too long. Address should not exceed 100 characters")
      .refine(
         (val) => !/^\d+$/.test(val),
         "Address cannot contain only numbers (please include street name, city, etc.)"
      ),

      
   hostDocument: z
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
      ),
});



export type HostUpgradeFormData = z.infer<typeof hostUpgradeSchema>;