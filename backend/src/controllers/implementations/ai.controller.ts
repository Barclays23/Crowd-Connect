// src/controllers/implementations/ai.controller.ts
import { Request, Response, NextFunction } from "express";
import { AiService } from "@/services/ai-services/implementations/ai.service";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { GeneratePosterDTO } from "@/dtos/ai.dto";
import { IAiController } from "@/controllers/interfaces/IAiContoller";
import { USER_MESSAGES } from "@/constants/messages.constants";




export class AiController implements IAiController {
    constructor(
        private readonly _aiService: AiService
    ) {}

    async generateEventPoster(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Ensure the user is authorized (caught by middleware, but good for type safety)
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
                    success: false, 
                    message: USER_MESSAGES.USER_INFORMATION_MISSING
                });
                return;
            }

            // The body is already validated by Zod at this point
            const body = req.body;

            const dto: GeneratePosterDTO = {
                title: body.title,
                category: body.category,
                description: body.description,
                startDateTime: body.startDateTime,
                locationName: body.locationName
            };

            const result = await this._aiService.generateEventPoster(dto);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "AI Poster generated successfully! You can regenerate or keep this one.",
                aiPosterData: result.base64Data // Return the base64 string for live preview
            });

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in AiController.generateEventPoster:', msg);
            next(error);
        }
    }
}