// frontend/src/components/review/ReviewModal.tsx
import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/text-area";
import { toast } from "react-toastify";
import { reviewServices } from "@/services/reviewServices";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import type { ApiResponse } from "@/types/common.types";
import { ReviewSchema } from "@/schemas/review.schema";
import { FieldError } from "@/components/ui/FieldError";



interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  eventTitle: string;
  onSuccess: () => void;
}



export function ReviewModal({ isOpen, onClose, bookingId, eventTitle, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ rating?: string; reviewText?: string }>({});



    const handleSubmit = async () => {
        setErrors({});
        
        if (rating === 0) {
            toast.error("Please select a star rating.");
            return;
        }

        const validation = ReviewSchema.safeParse({ rating, reviewText });

        try {
            setLoading(true);
            const payload = { bookingId, rating, reviewText };
            const response: ApiResponse<void> = await reviewServices.submitReview(payload);

            toast.success(response.message);
            toast.success(".....Review submitted successfully! Thank you for your feedback.");
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
            <div className="space-y-6">
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
                                onClick={() => {
                                    setRating(star);
                                    if (errors.rating) setErrors(prev => ({ ...prev, rating: undefined }));
                                }}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    size={40}
                                    className={
                                        (hoveredRating || rating) >= star
                                            ? "text-amber-500 fill-amber-500"
                                            : "text-(--border-muted) fill-(--border-muted)"
                                    }
                                />
                            </button>
                        ))}
                    </div>
                    <FieldError message={errors.rating} className="text-center" />
                </div>

                {/* Review Text Area */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-(--text-primary)">
                        Share your thoughts (Optional)
                    </label>
                    <TextArea
                        placeholder="What did you love? What could be improved?"
                        value={reviewText}
                        onChange={(e) => {
                            setReviewText(e.target.value);
                            if (errors.reviewText) setErrors(prev => ({ ...prev, reviewText: undefined }));
                        }}
                        disabled={loading}
                        className="w-full min-h-24"
                        maxLength={500}
                    />
                    <FieldError message={errors.reviewText} />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-(--border-default)">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="default" onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Review
                    </Button>
                </div>
            </div>
        </Modal>
    );


    // return (
    //     <Modal isOpen={isOpen} onClose={onClose} title="Rate Your Experience" size="md">
    //         <div className="space-y-6">
    //             <p className="text-sm text-(--text-secondary)">
    //                 How was <strong>{eventTitle}</strong>? Your feedback helps the host and other users!
    //             </p>

    //             {/* Star Selection */}
    //             <div className="flex justify-center gap-2">
    //                 {[1, 2, 3, 4, 5].map((star) => (
    //                     <button
    //                         key={star}
    //                         type="button"
    //                         onClick={() => setRating(star)}
    //                         onMouseEnter={() => setHoveredRating(star)}
    //                         onMouseLeave={() => setHoveredRating(0)}
    //                         className="focus:outline-none transition-transform hover:scale-110"
    //                     >
    //                     <Star
    //                         size={36}
    //                         className={
    //                         (hoveredRating || rating) >= star
    //                             ? "text-amber-500 fill-amber-500"
    //                             : "text-gray-300"
    //                         }
    //                     />
    //                     </button>
    //                 ))}
    //             </div>

    //             {/* Text Area */}
    //             <div className="space-y-2">
    //                 <label className="text-sm font-semibold text-(--text-primary)">
    //                     Share your thoughts (Optional)
    //                 </label>
    //                 <TextArea
    //                     placeholder="What did you love? What could be improved?"
    //                     value={reviewText}
    //                     onChange={(e) => setReviewText(e.target.value)}
    //                     disabled={loading}
    //                     className="w-full min-h-24"
    //                     maxLength={500}
    //                 />
    //             </div>

    //             {/* Footer */}
    //             <div className="flex justify-end gap-3 pt-4 border-t border-(--border-default)">
    //                 <Button variant="ghost" onClick={onClose} disabled={loading}>
    //                     Cancel
    //                 </Button>
    //                 <Button variant="default" onClick={handleSubmit} disabled={loading || rating === 0}>
    //                     {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    //                     Submit Review
    //                 </Button>
    //             </div>
    //         </div>
    //     </Modal>
    // );


}