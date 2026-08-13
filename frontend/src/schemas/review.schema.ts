// frontend/src/schemas/review.schema.ts
import { z } from "zod";




/* ---------- Base Fields ---------- */
export const ratingBase = z
    .number()
    .int()
    .min(1, "Please select a star rating.")
    .max(5, "Rating cannot exceed 5 stars.");



export const reviewTextBase = z
    .string()
    .trim()
    .min(1, "Please provide your review/feedback.")
    .min(10, "Your review is a bit too short. Please use at least 10 characters.")
    .max(200, "Please shorten your feedback to a maximum of 200 characters.")

    // 1. Require at least SOME letters (prevents pure numbers like "123456789012")
    .refine((value) => /[a-zA-Z]/.test(value), { 
        message: "Your review must contain actual words, not just numbers or symbols." 
    })
    // 2. Prevent excessively long unbroken strings (e.g., "asdfghjklqwertyuiopzxcv")
    .refine((value) => !/\S{20,}/.test(value), {
        message: "Please use proper spacing between your words."
    })

    // 3. Prevent symbol spam (max 30% special characters)
    .refine((value) => {
        if (!value) return true; 
        const total = value.length;
        const specialCount = (value.match(/[^A-Za-z0-9\s.,'?!()-]/g) || []).length;
        return specialCount / total <= 0.3; 
    }, { message: "Your review contains too many special characters." });






/* ---------- Request Schemas ---------- */
export const ReviewFormSchema = z.object({
    rating: ratingBase,
    reviewText: reviewTextBase,
});


export const SubmitReviewSchema = z.object({
    bookingId: z.string().min(1, "Booking ID is required."),
    rating: ratingBase,
    reviewText: reviewTextBase,
});


export const EditReviewSchema = z.object({
    rating: ratingBase,
    reviewText: reviewTextBase,
});


export type ReviewFormData = z.infer<typeof ReviewFormSchema>;
export type SubmitReviewFormData = z.infer<typeof SubmitReviewSchema>;
export type EditReviewFormData = z.infer<typeof EditReviewSchema>;