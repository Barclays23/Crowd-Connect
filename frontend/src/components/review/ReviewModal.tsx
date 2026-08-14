// frontend/src/components/review/ReviewModal.tsx
import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/text-area";
import { toast } from "react-toastify";
import { reviewServices } from "@/services/reviewServices";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import type { ApiResponse } from "@/types/common.types";
import { ReviewFormSchema, type ReviewFormData } from "@/schemas/review.schema";
import { FieldError } from "@/components/shared/FieldError";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";




interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    eventTitle: string;
    onSuccess: () => void;
}



export function ReviewModal({ isOpen, onClose, bookingId, eventTitle, onSuccess }: ReviewModalProps) {
    const [hoveredRating, setHoveredRating] = useState(0);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<ReviewFormData>({
        resolver: zodResolver(ReviewFormSchema),
        defaultValues: {
            rating: 0,
            reviewText: "",
        },
    });

    const currentRating = watch("rating");

    // 2. Reset the form whenever the modal opens or closes
    useEffect(() => {
        if (!isOpen) {
            reset();
            setHoveredRating(0);
        }
    }, [isOpen, reset]);

    const onSubmit = async (data: ReviewFormData) => {
        try {
            setLoading(true);
            const payload = { bookingId, rating: data.rating, reviewText: data.reviewText };
            const response: ApiResponse<void> = await reviewServices.submitReview(payload);

            toast.success(response.message);
            onSuccess();
            onClose();

        } catch (error: unknown) {
            const errorMessage = getApiErrorMessage(error);
            if (errorMessage) toast.error(errorMessage);

        } finally {
            setLoading(false);
        }
    };



    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Rate Your Experience" size="md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <p className="text-sm text-(--text-secondary) text-center">
                    How was <strong>{eventTitle}</strong>? Your feedback helps the host and other users!
                </p>

                {/* Star Selection */}
                <div className="flex flex-col items-center gap-1">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setValue("rating", star, { shouldValidate: true })}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    size={40}
                                    className={
                                        (hoveredRating || currentRating) >= star
                                            ? "text-amber-500 fill-amber-500"
                                            : "text-(--border-muted) fill-(--border-muted)"
                                    }
                                />
                            </button>
                        ))}
                    </div>
                    <FieldError message={errors.rating?.message} className="text-center" />
                </div>

                {/* Review Text Area */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-(--text-primary)">
                        Share your thoughts <span className="text-red-500">*</span>
                    </label>
                    <TextArea
                        {...register("reviewText")}
                        placeholder="What did you love? What could be improved?"
                        disabled={loading}
                        className={`w-full min-h-24 ${errors.reviewText ? 'border-red-500 focus:ring-red-500' : ''}`}
                        maxLength={200}
                    />
                    <FieldError message={errors.reviewText?.message} />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-(--border-default)">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    {/* Button type submit triggers handleSubmit */}
                    <Button type="submit" variant="default" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Review
                    </Button>
                </div>
            </form>
        </Modal>
    );
}