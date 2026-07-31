// backend/src/controllers/implementations/chat.controller.ts
import { Request, Response, NextFunction } from "express";
import { IChatController } from "@/controllers/interfaces/IChatController";
import { IChatService } from "@/services/chat-services/interfaces/IChatService";
import { HTTP_STATUS } from "@/constants/http-status.constants";




export class ChatController implements IChatController {
    constructor(
        private readonly _chatService: IChatService
    ) {}

    async askQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { question } = req.body;

            if (!question) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({ 
                    success: false, 
                    message: "Question is required." 
                });
                return;
            }

            const answer = await this._chatService.generateAnswer(question);

            console.log('answer to the user query :', answer);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Answer generated successfully.",
                data: answer,
            });

        } catch (error: unknown) {
            next(error);
        }
    }
}