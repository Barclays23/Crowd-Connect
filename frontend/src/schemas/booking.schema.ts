import z from "zod";



export const cancelReasonBase = z
    .string()
    .trim()
    .min(1, "You must provide the reason to cancel booking.")
    // prevent symbol spam at the start
    .refine(
        (value) => !/^[^A-Za-z0-9]/.test(value), "Reason cannot start with special characters",
    )
    .min(20, "Reason must be at least 20 characters")
    .max(100, "Reason cannot be more than 100 characters")
    .regex(
        /\b[A-Za-z]{3,}\b/,
        "Reason must contain meaningful words"
    )
    // limit special characters dominance
    .refine((value) => {
        const total = value.length;
        const specialCount = (value.match(/[^A-Za-z0-9\s.,'()-]/g) || []).length;
        return specialCount / total <= 0.3; // 30%
    }, {
        message: "Reason contains too many special characters"
    })