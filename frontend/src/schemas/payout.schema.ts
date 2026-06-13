// frontend/src/schemas/payout.schema.ts

import { z } from "zod";
import { 
    ACCEPTED_PAYOUT_PROOF_TYPES, 
    MAX_PAYOUT_PROOF_SIZE 
} from "@/constants/files.constants";





export const PayoutRequestSchema = z.object({
    proofs: z.custom<File[]>()
        .refine(
            // If files exist, length MUST be exactly 3. 
            // (!files allows it to be empty if attendance is high and proofs aren't needed)
            (files) => !files || files.length === 3, 
            "You must upload exactly 3 proof images."
        )
        .refine(
            (files) => !files || files.every((file) => file.size <= MAX_PAYOUT_PROOF_SIZE),
            `Each file size should be less than ${MAX_PAYOUT_PROOF_SIZE / (1024 * 1024)}MB.`
        )
        .refine(
            (files) => !files || files.every((file) => ACCEPTED_PAYOUT_PROOF_TYPES.includes(file.type)),
            "Only .jpg, .jpeg, .png and .webp formats are supported."
        )
        .optional(),
});



export const RejectPayoutSchema = z.object({
    reason: z.string()
        .trim()
        .min(1, "Rejection reason is required.")
        .min(10, "Please provide a detailed reason (at least 10 characters) so the host understands.")
        .max(200, "Reason is too long. Keep it under 200 characters.")
        .regex(
            /\b[A-Za-z]{3,}\b/,
            "reason must contain meaningful words"
        )
        // limit special characters
        .refine((value) => {
            const total = value.length;
            const specialCount = (value.match(/[^A-Za-z0-9\s.,'()-]/g) || []).length;
            return specialCount / total <= 0.3; // 30%
        }, {
            message: "Reason contains too many special characters"
        })
});



export type RejectPayoutFormValues  = z.infer<typeof RejectPayoutSchema>;
export type PayoutRequestFormValues = z.infer<typeof PayoutRequestSchema>;