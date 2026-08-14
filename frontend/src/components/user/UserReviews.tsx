// frontend/src/components/user/UserReviews.tsx
import { useState, useEffect, useCallback } from "react";
import { Loader2, Star, Edit, Trash2, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPagination } from "@/components/user/UserPagination";
import { LoadingSpinner1 } from "@/components/shared/LoadingSpinner1";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { EditReviewModal } from "@/components/review/EditReviewModal";
import { reviewServices } from "@/services/reviewServices";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { formatDate2 } from "@/utils/dateAndTimeFormats";
import { toast } from "react-toastify";
import type { IReviewState } from "@/types/review.types";
import { StarRating } from "@/components/shared/StarRating";
import type { ApiResponse } from "@/types/common.types";





function UserReviews() {
    const [reviews, setReviews] = useState<IReviewState[]>([]);
    const [totalReviews, setTotalReviews] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [reviewToEdit, setReviewToEdit] = useState<IReviewState | null>(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const itemsPerPage = 6;

    const fetchMyReviews = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response: ApiResponse<IReviewState[]> = await reviewServices.getMyReviews(currentPage, itemsPerPage);
            setReviews(response.data ?? []);
            setTotalReviews(response.pagination?.totalCount ?? 0);
            setTotalPages(response.pagination?.totalPages ?? 1);

        } catch (err: unknown) {
            const errorMessage = getApiErrorMessage(err);
            if (errorMessage) toast.error(errorMessage);
            setError(errorMessage ?? null);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchMyReviews();
    }, [fetchMyReviews]);

    const handleEditClick = (review: IReviewState) => {
        setReviewToEdit(review);
        setEditModalOpen(true);
    };

    const handleDeleteClick = (reviewId: string) => {
        setReviewToDelete(reviewId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!reviewToDelete) return;
        try {
            setIsDeleting(true);
            const response: ApiResponse<void> = await reviewServices.deleteReview(reviewToDelete);
            toast.success(response.message);
            fetchMyReviews();

        } catch (error: unknown) {
            const errorMessage = getApiErrorMessage(error);
            if (errorMessage) toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setReviewToDelete(null);
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-(--brand-primary)" />
                <h2 className="text-2xl font-bold tracking-tight">My Reviews ({totalReviews})</h2>
            </div>

            <div className="relative min-h-100">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
                        <LoadingSpinner1 size="lg" message="Loading your reviews..." />
                    </div>
                )}

                {error ? (
                    <div className="flex h-48 items-center justify-center text-destructive">{error}</div>
                ) : reviews.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-card border rounded-lg">
                        <MessageSquareText className="h-12 w-12 opacity-20 mb-3" />
                        <p className="text-base font-medium">No reviews written yet.</p>
                        <p className="text-sm opacity-70">Attend an event to share your experience!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reviews.map((review) => (
                            <Card key={review.reviewId} className="bg-(--bg-secondary) border border-(--card-border) shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-(--heading-primary) line-clamp-1 flex-1 pr-4">
                                                {review.event.eventTitle}
                                            </h3>
                                            <span className="text-xs text-(--text-tertiary) whitespace-nowrap">
                                                {formatDate2(review.createdAt)}
                                            </span>
                                        </div>
                                        <StarRating rating={review.rating} size={14} className="text-amber-500 mb-3" />
                                        <p className="text-sm text-(--text-secondary) italic line-clamp-3">
                                            "{review.reviewText}"
                                        </p>
                                    </div>
                                    
                                    <div className="flex justify-end gap-2 pt-3 border-t border-(--border-muted)">
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            onClick={() => handleEditClick(review)}
                                            className="h-8 text-xs font-medium"
                                        >
                                            <Edit className="w-3 h-3 mr-1.5" /> Edit
                                        </Button>
                                        <Button 
                                            variant="destructive" 
                                            size="sm" 
                                            onClick={() => handleDeleteClick(review.reviewId)}
                                            className="h-8 text-xs font-medium"
                                        >
                                            <Trash2 className="w-3 h-3 mr-1.5" /> Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {totalReviews > 0 && (
                <UserPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            <EditReviewModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setReviewToEdit(null);
                }}
                review={reviewToEdit}
                onSuccess={fetchMyReviews}
            />

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Review"
                description="Are you sure you want to delete this review? This action cannot be undone and will affect the event's overall rating."
                confirmText="Delete Review"
                loadingText="Deleting..."
                variant="danger"
                loading={isDeleting}
            />
        </div>
    );
}

export default UserReviews;
