import { EditReviewRequestDTO, GetReviewsResponseDTO, SubmitReviewRequestDTO } from "@/dtos/review.dto";
import { GetReviewsAdminFilter } from "@/types/review.types";



export interface IReviewService {
    submitReview(userId: string, reviewDto: SubmitReviewRequestDTO): Promise<void>

    editReview(userId: string, reviewId: string, reviewDto: EditReviewRequestDTO): Promise<void>

    deleteReview(userId: string, role: string, reviewId: string): Promise<void>

    getReviewsForUser(userId: string, page: number, limit: number): Promise<GetReviewsResponseDTO>;

    getReviewsForHost(hostId: string, page: number, limit: number): Promise<GetReviewsResponseDTO>

    getReviewsForEvent(eventId: string, page: number, limit: number): Promise<GetReviewsResponseDTO>

    getAllReviewsForAdmin(filters: GetReviewsAdminFilter): Promise<GetReviewsResponseDTO>;

}