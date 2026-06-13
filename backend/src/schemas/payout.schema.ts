// backend/src/schemas/payout.schema.ts
import { z } from "zod";



// Used in: GET /my-payouts and GET /admin/payouts
export const GetPayoutsQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number),
    limit: z.string().regex(/^\d+$/).optional().transform(Number),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    status: z.string().optional(), // Or use an enum if you want strict status filtering
    search: z.string().optional(),
});



// Used in: PUT /admin/payouts/:payoutId/review
export const ReviewPayoutBodySchema = z.object({
    action: z.enum(["approve", "reject"]),
    rejectionReason: z.string().optional()
}).refine(data => {
    // If the admin clicks "reject", they MUST provide a reason.
    if (data.action === "reject" && 
        (!data.rejectionReason || data.rejectionReason.trim() === "")) {
        return false;
    }
    return true;
}, {
    message: "Rejection reason is required when rejecting a payout.",
    path: ["rejectionReason"]
});