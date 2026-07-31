// frontend/src/components/common/StarRating.tsx
import { Star } from "lucide-react";

interface StarRatingProps {
    rating: number;
    size?: number;
    className?: string; // Color for the filled stars
    emptyColorClassName?: string; // Color for the empty background stars
}

export function StarRating({ 
    rating, 
    size = 16, 
    className = "text-(--badge-warning-text)",
    emptyColorClassName = "text-(--border-muted) dark:text-(--text-tertiary)/30"
}: StarRatingProps) {
    // Ensure rating stays within 0-5 bounds
    const clampedRating = Math.max(0, Math.min(5, rating));
    
    // Calculate exact fill percentage (e.g., 2.5 rating = 50% width)
    const fillPercentage = (clampedRating / 5) * 100;

    return (
        <div className="relative inline-flex" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
            {/* 1. Background Empty Stars */}
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((index) => (
                    <Star key={`empty-${index}`} size={size} className={emptyColorClassName} />
                ))}
            </div>

            {/* 2. Foreground Filled Stars (Clipped using width percentage) */}
            <div 
                className="absolute top-0 left-0 overflow-hidden" 
                style={{ width: `${fillPercentage}%` }}
            >
                {/* ADDED: w-max prevents Flexbox from shrinking the stars! */}
                <div className="flex gap-0.5 w-max">
                    {[1, 2, 3, 4, 5].map((index) => (
                        <Star key={`filled-${index}`} size={size} className={className} fill="currentColor" />
                    ))}
                </div>
            </div>
        </div>
    );
}