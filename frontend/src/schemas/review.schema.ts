// frontend/src/schemas/review.schema.ts


import { z } from "zod";


export const ReviewSchema = z.object({
    rating      : z.number().min(1, "Please select a rating").max(5),
});






/* ---------- Base Fields ---------- */
export const ratingBase = z.coerce
    .number()
    .int()
    .min(1, "Please select a star rating.")
    .max(5, "Rating cannot exceed 5 stars.");



export const reviewTextBase = z
    .string()
    .trim()
    .max(10, "Review must be at least 10 characters")
    .max(200, "Review cannot exceed 200 characters.")
    // Optional: Prevent symbol spam just like you did in event descriptions
    .refine((value) => {
        if (!value) return true; // It's optional, so empty is fine
        const total = value.length;
        const specialCount = (value.match(/[^A-Za-z0-9\s.,'?!()-]/g) || []).length;
        return specialCount / total <= 0.3; // max 30% special characters
    }, { message: "Review contains too many special characters." })
    .optional();






/* ---------- Request Schemas ---------- */
export const SubmitReviewSchema = z.object({
    bookingId: z.string().min(1, "Booking ID is required."),
    rating: ratingBase,
    reviewText: reviewTextBase,
});


export const EditReviewSchema = z.object({
    rating: ratingBase,
    reviewText: reviewTextBase,
});


export type SubmitReviewFormValues = z.infer<typeof SubmitReviewSchema>;
export type EditReviewFormValues = z.infer<typeof EditReviewSchema>;