// frontend/src/components/review/ReviewsSection.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Star, User, MessageSquareOff, Filter, ArrowUpDown } from "lucide-react";
import { reviewServices } from "@/services/reviewServices";
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";
import { UserPagination } from "@/components/user/UserPagination";
import { formatDate2 } from "@/utils/dateAndTimeFormats";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import type { IReviewState } from "@/types/review.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarRating } from "@/components/common/StarRating";



interface ReviewsSectionProps {
    eventId?: string;
    hostId?: string;
    averageRating?: number;
    totalReviews?: number;
}




export default function ReviewsSection({ eventId, hostId, averageRating, totalReviews }: ReviewsSectionProps) {
    const [reviews, setReviews] = useState<IReviewState[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [ratingFilter, setRatingFilter] = useState<string>("all");
    const [sortOption, setSortOption] = useState<string>("newest");
    const itemsPerPage = 10;



    const fetchReviews = useCallback(async () => {
        if (!eventId && !hostId) return;
        
        try {
            setLoading(true);
            let response;
            if (eventId) {
                response = await reviewServices.getEventReviews(eventId, currentPage, itemsPerPage);
            } else if (hostId) {
                response = await reviewServices.getHostReviews(hostId, currentPage, itemsPerPage);
            }

            if (response?.data) {
                setReviews(response.data || []);
                setTotalPages(response.pagination?.totalPages || 1);
            }
        } catch (error: unknown) {
            const errorMessage = getApiErrorMessage(error);
            if (errorMessage) toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [eventId, hostId, currentPage]);


    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);


    // Local Sorting & Filtering (Applied to current page of data)
    const displayedReviews = useMemo(() => {
        let filtered = [...reviews];
        
        if (ratingFilter !== "all") {
            const starTarget = parseInt(ratingFilter);
            filtered = filtered.filter(r => Math.round(r.rating) === starTarget);
        }

        filtered.sort((a, b) => {
            if (sortOption === "highest") return b.rating - a.rating;
            if (sortOption === "lowest") return a.rating - b.rating;
            // Default "newest"
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return filtered;
    }, [reviews, ratingFilter, sortOption]);



    return (
        <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--border-muted) pb-4">
                <div className="flex items-center gap-2">
                    <Star className="text-(--badge-warning-text) fill-(--badge-warning-text)" size={24} />
                    <h2 className="text-xl font-bold text-(--heading-primary)">
                        {eventId ? "Attendee Reviews" : "Overall Reviews"}
                        <span className="bg-(--bg-secondary) text-(--text-secondary) px-3 py-0.5 rounded-full text-md font-bold border border-(--border-muted) ml-2">
                            {displayedReviews.length}
                        </span>
                    </h2>
                    {totalReviews !== undefined && totalReviews > 0 && (
                        <span className="bg-(--bg-secondary) text-(--text-secondary) px-2 py-0.5 rounded-full text-xs font-bold border border-(--border-muted) ml-2">
                            {totalReviews} Total
                        </span>
                    )}
                </div>
                
                {averageRating !== undefined && averageRating > 0 && (
                    <div className="text-sm font-semibold bg-(--bg-secondary) px-3 py-1.5 rounded-lg border border-(--border-muted) shrink-0">
                        {eventId ? "Event Rating" : "Overall Rating"}:  <span className="ml-1 text-(--badge-warning-text)">{averageRating.toFixed(1)} / 5.0</span>
                    </div>
                )}
            </div>

            {/* Filters Toolbar */}
            {reviews.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-(--text-tertiary)" />
                        <Select value={ratingFilter} onValueChange={setRatingFilter}>
                            <SelectTrigger className="w-full sm:w-36 h-9 border-(--border-muted) bg-(--bg-neutral)">
                                <SelectValue placeholder="All Ratings" />
                            </SelectTrigger>
                            <SelectContent className="bg-(--card-bg) border-(--border-default)">
                                <SelectItem value="all">All</SelectItem>
                                {/* <SelectItem value="5">5 Stars</SelectItem>
                                <SelectItem value="4">4 Stars</SelectItem>
                                <SelectItem value="3">3 Stars</SelectItem>
                                <SelectItem value="2">2 Stars</SelectItem>
                                <SelectItem value="1">1 Star</SelectItem> */}
                                <SelectItem value="5" className="text-(--badge-warning-text)"> ★★★★★</SelectItem>
                                <SelectItem value="4" className="text-(--badge-warning-text)"> ★★★★</SelectItem>
                                <SelectItem value="3" className="text-(--badge-warning-text)"> ★★★</SelectItem>
                                <SelectItem value="2" className="text-(--badge-warning-text)"> ★★</SelectItem>
                                <SelectItem value="1" className="text-(--badge-warning-text)"> ★</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <ArrowUpDown className="w-4 h-4 text-(--text-tertiary)" />
                        <Select value={sortOption} onValueChange={setSortOption}>
                            <SelectTrigger className="w-full sm:w-40 h-9 border-(--border-muted) bg-(--bg-neutral)">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent className="bg-(--card-bg) border-(--border-default)">
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="highest">Highest Rating</SelectItem>
                                <SelectItem value="lowest">Lowest Rating</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {/* List State */}
            {loading && reviews.length === 0 ? (
                <div className="flex h-40 items-center justify-center">
                    <LoadingSpinner1 size="md" message="Loading reviews..." />
                </div>
            ) : reviews.length === 0 ? (
                <div className="p-10 text-center bg-(--card-bg) border border-(--card-border) rounded-2xl">
                    <MessageSquareOff size={40} className="mx-auto text-(--text-tertiary) mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-(--heading-primary)">No Reviews Yet</h3>
                    <p className="text-(--text-secondary) max-w-md mx-auto mt-2">
                        {eventId 
                            ? "Attendees haven't left any reviews for this event yet." 
                            : "This organizer hasn't received any reviews yet."}
                    </p>
                </div>
            ) : displayedReviews.length === 0 ? (
                <div className="p-8 text-center text-(--text-tertiary) bg-(--bg-secondary) rounded-xl border border-(--border-muted)">
                    No reviews match your current filters on this page.
                </div>
            ) : (
                <div className="grid gap-4">
                    {displayedReviews.map((review) => (
                        <div key={review.reviewId} className="bg-(--card-secondary)/40 border border-(--card-border) rounded-2xl p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-(--bg-secondary) flex items-center justify-center overflow-hidden shrink-0 border border-(--border-muted)">
                                        {review.user?.profilePic ? (
                                            <img src={review.user.profilePic} alt={review.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-(--text-tertiary)" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-(--heading-primary)">
                                            {review.user?.name || "Anonymous Attendee"}
                                        </h4>
                                        <p className="text-xs text-(--text-tertiary)">{formatDate2(review.createdAt)}</p>
                                    </div>
                                </div>
                                <StarRating 
                                    rating={review.rating} 
                                    size={14} 
                                    className="text-(--badge-warning-text)" 
                                    emptyColorClassName="text-white/20" 
                                />
                            </div>
                            {review.reviewText && (
                                <p className="text-sm text-(--text-secondary) leading-relaxed mt-2">{review.reviewText}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="pt-4 flex justify-center">
                    <UserPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
        </div>
    );
}