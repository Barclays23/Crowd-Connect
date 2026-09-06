// backend/src/controllers/implementations/chat.controller.ts
import { Request, Response, NextFunction } from "express";
import { IChatController } from "@/controllers/interfaces/IChatController";
import { IAiChatService } from "@/services/ai-chat-services/interfaces/IAiChatService";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { createHttpError } from "@/utils/httpError.utils";
import { ChatResponseDTO } from "@/dtos/chat.dto";
import { ApiResponse } from "@/utils/apiResponse.utils";




export class ChatController implements IChatController {
    constructor(
        private readonly _chatService: IAiChatService
    ) {}

    async askQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { question } = req.body;

            if (!question) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Question is required.");
            }

            const answer: ChatResponseDTO = await this._chatService.generateAnswer(question);

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<ChatResponseDTO>("Answer generated successfully.", answer)
            );

        } catch (error: unknown) {
            next(error);
        }
    }
}