// frontend/src/components/admin/review/admin-reviews-list.tsx
import { useState, useEffect, useCallback } from "react";
import { Search, Trash2, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { reviewServices } from "@/services/reviewServices";
import { toast } from "react-toastify";
import { formatDate2 } from "@/utils/dateAndTimeFormats";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { getInitials } from "@/utils/namingConventions";
import { StarRating } from "@/components/shared/StarRating";
import type { 
    AdminReviewQueryParams, 
    IReviewState 
} from "@/types/review.types";
import type { ApiResponse } from "@/types/common.types";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { Tooltip } from "@/components/shared/Tooltip";





export function AdminReviewsList() {
    const [reviews, setReviews] = useState<IReviewState[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [ratingFilter, setRatingFilter] = useState("all");
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    const [deleteReview, setDeleteReview] = useState<IReviewState | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);



    useEffect(() => {
        const timer = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);



    const fetchReviews = useCallback(async () => {
        setLoading(true);
        
        try {
            
            const params: AdminReviewQueryParams = {
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearchTerm,
                rating: ratingFilter,
            }

            const response: ApiResponse<IReviewState[]> = await reviewServices.getAllReviewsForAdmin(params);
            
            setReviews(response.data);
            setTotalReviews(response.pagination?.totalCount || 0);
            setTotalPages(response.pagination?.totalPages || 1);

        } catch (error: unknown) {
            const errorMessage = getApiErrorMessage(error);
            if (errorMessage) toast.error(errorMessage);
        } finally {
        setLoading(false);
        }

    }, [currentPage, debouncedSearchTerm, ratingFilter]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);



    const handleDeleteReview = async () => {
        if (!deleteReview) return;
        try {
        setIsDeleting(true);
        const response: ApiResponse<void> = await reviewServices.deleteReview(deleteReview.reviewId);
        toast.success(response.message || "Review deleted successfully");
        setReviews(prev => prev.filter(r => r.reviewId !== deleteReview.reviewId));
        setTotalReviews(prev => prev - 1);
        } catch (error: unknown) {
        const errorMessage = getApiErrorMessage(error);
        if (errorMessage) toast.error(errorMessage);
        } finally {
        setIsDeleting(false);
        setDeleteReview(null);
        }
    };



    return (
        <Card className="shadow-(--shadow-sm) border border-(--border-default) rounded-2xl overflow-hidden">
        <CardHeader className="bg-(--card-bg) border-b border-(--border-default)">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle className="text-2xl font-bold text-(--heading-primary)">Platform Reviews</CardTitle>
                <p className="text-sm text-(--text-secondary) mt-1">Manage and moderate user reviews ({totalReviews} total)</p>
            </div>
            </div>
        </CardHeader>

        <CardContent className="p-6 bg-(--card-secondary)">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-tertiary)" />
                <Input
                placeholder="Search in review text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 border-(--border-muted) rounded-xl"
                />
            </div>
            <Select value={ratingFilter} onValueChange={(v) => { setRatingFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-40 h-11 rounded-xl border-(--border-muted)">
                <SelectValue placeholder="Filter by Rating" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
            </Select>
            </div>

            <div className="rounded-xl border border-(--border-default) overflow-hidden bg-(--card-bg)">
            <Table>
                <TableHeader>
                <TableRow className="bg-(--bg-tertiary) hover:bg-(--bg-tertiary)">
                    <TableHead className="text-(--text-secondary) font-semibold">User</TableHead>
                    <TableHead className="text-(--text-secondary) font-semibold">Event & Host</TableHead>
                    <TableHead className="text-(--text-secondary) font-semibold w-1/3">Review</TableHead>
                    <TableHead className="text-(--text-secondary) font-semibold">Rating</TableHead>
                    <TableHead className="text-(--text-secondary) font-semibold">Date</TableHead>
                    <TableHead className="text-right text-(--text-secondary) font-semibold">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading ? (
                    <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading reviews...</span>
                        </div>
                    </TableCell>
                    </TableRow>
                ) : reviews.length === 0 ? (
                    <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-(--text-secondary)">
                        No reviews found matching your criteria.
                    </TableCell>
                    </TableRow>
                ) : (
                    reviews.map((review) => (
                    <TableRow key={review.reviewId} className="group hover:bg-(--table-row-hover)">
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-(--border-muted)">
                            <AvatarImage src={review.user.profilePic} />
                            <AvatarFallback>{getInitials(review.user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                            <p className="font-medium text-sm text-(--text-primary)">{review.user.name}</p>
                            {review.user.email && <p className="text-xs text-(--text-tertiary)">{review.user.email}</p>}
                            </div>
                        </div>
                        </TableCell>

                        <TableCell>
                        <div className="max-w-50">
                            <p className="font-medium text-sm text-(--text-primary) truncate" title={review.event.eventTitle}>
                            {review.event.eventTitle || "Unknown Event"}
                            </p>
                            <p className="text-xs text-(--text-tertiary) truncate" title={review.hostName}>
                            Host: {review.hostName || "Unknown Host"}
                            </p>
                        </div>
                        </TableCell>

                        <TableCell>
                        <div className="max-w-75">
                            {review.reviewText ? (
                            <p className="text-sm text-(--text-secondary) line-clamp-2" title={review.reviewText}>
                                {review.reviewText}
                            </p>
                            ) : (
                            <span className="text-xs italic text-(--text-tertiary)">No written review</span>
                            )}
                        </div>
                        </TableCell>

                        <TableCell>
                        <div className="flex items-center gap-1.5 font-bold text-sm text-(--badge-warning-text)">
                            {review.rating.toFixed(1)}
                            <StarRating rating={review.rating} size={12} />
                        </div>
                        </TableCell>

                        <TableCell className="text-sm text-(--text-secondary) whitespace-nowrap">
                        {formatDate2(review.createdAt)}
                        </TableCell>

                        <TableCell className="text-right">
                            <Tooltip content="Delete Review" side="top">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setDeleteReview(review)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
            </div>

            {!loading && reviews.length > 0 && (
            <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalReviews}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />
            )}
        </CardContent>

        <ConfirmationModal
            isOpen={!!deleteReview}
            onClose={() => setDeleteReview(null)}
            onConfirm={handleDeleteReview}
            title="Delete Review"
            description="Are you sure you want to permanently remove this review? The event and host average ratings will be automatically recalculated."
            confirmText={isDeleting ? "Deleting..." : "Delete Review"}
            variant="danger"
            loading={isDeleting}
        />
        </Card>
    );
}