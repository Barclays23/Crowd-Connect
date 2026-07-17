import { EditReviewRequestDTO, GetReviewsResponseDTO, SubmitReviewRequestDTO } from "@/dtos/review.dto";



export interface IReviewService {
    submitReview(userId: string, dto: SubmitReviewRequestDTO): Promise<void>

    editReview(userId: string, reviewId: string, dto: EditReviewRequestDTO): Promise<void>

    deleteReview(userId: string, role: string, reviewId: string): Promise<void>

    getReviewsForHost(hostId: string, page: number, limit: number): Promise<GetReviewsResponseDTO>

}