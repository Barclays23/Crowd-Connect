// frontend/src/components/review/EditReviewModal.tsx
import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/text-area";
import { toast } from "react-toastify";
import { reviewServices } from "@/services/reviewServices";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import type { ApiResponse } from "@/types/common.types";
import { EditReviewSchema, type EditReviewFormData } from "@/schemas/review.schema";
import { FieldError } from "@/components/shared/FieldError";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IReviewState } from "@/types/review.types";




interface EditReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    review: IReviewState | null;
    onSuccess: () => void;
}



export function EditReviewModal({ isOpen, onClose, review, onSuccess }: EditReviewModalProps) {
    const [hoveredRating, setHoveredRating] = useState(0);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<EditReviewFormData>({
        resolver: zodResolver(EditReviewSchema),
        defaultValues: {
            rating: 0,
            reviewText: "",
        },
    });

    const currentRating = watch("rating");

    // Populate the form with the existing review data when opened
    useEffect(() => {
        if (isOpen && review) {
            setValue("rating", review.rating);
            setValue("reviewText", review.reviewText || "");
        } else {
            reset();
            setHoveredRating(0);
        }
    }, [isOpen, review, setValue, reset]);



    const onSubmit = async (data: EditReviewFormData) => {
        if (!review) return;
        
        try {
            setLoading(true);
            const response: ApiResponse<void> = await reviewServices.editReview(review.reviewId, data);
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

    if (!review) return null;

    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Review" size="md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                <div className="flex justify-end gap-3 pt-4 border-t border-(--border-default)">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="default" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}