// frontend/src/schemas/payout.schema.ts

import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const PayoutRequestSchema = z.object({
    eventId: z.string().min(1, "Event ID is required"),
    
    // Keep it as a FileList throughout the schema
    proofs: z.custom<FileList>()
        .refine(
            (files) => !files || files.length <= 3, 
            "Maximum 3 proof images allowed."
        )
        .refine(
            (files) => !files || Array.from(files).every((file) => file.size <= MAX_FILE_SIZE),
            "Each file size should be less than 5MB."
        )
        .refine(
            (files) => !files || Array.from(files).every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
            "Only .jpg, .jpeg, .png and .webp formats are supported."
        )
        .optional(),
});

export type PayoutRequestFormValues = z.infer<typeof PayoutRequestSchema>;