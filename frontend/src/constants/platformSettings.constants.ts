// frontend/src/constants/platformSettings.constants.ts

export type PolicyKey = "generalTerms" | "bookingTerms" | "cancellationTerms" | "hostTerms" | "reviewTerms";



export const POLICY_SECTIONS: { key: PolicyKey; title: string; desc: string }[] = [
    { key: "generalTerms", title: "General Platform Terms", desc: "Rules for all users utilizing CrowdConnect." },
    { key: "bookingTerms", title: "Booking & Ticketing Terms", desc: "Agreements presented during checkout." },
    { key: "cancellationTerms", title: "Cancellation & Refunds", desc: "Rules outlining grace periods and refunds." },
    { key: "hostTerms", title: "Host Agreement", desc: "Terms hosts agree to when creating events and requesting payouts." },
    { key: "reviewTerms", title: "Review Guidelines", desc: "Community standards for posting ratings." },
];
