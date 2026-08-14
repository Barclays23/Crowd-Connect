// src/controllers/implementations/ai.controller.ts
import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { GeneratePosterDTO, GeneratePosterResponseDTO } from "@/dtos/ai.dto";
import { IAiController } from "@/controllers/interfaces/IAiContoller";
import { USER_MESSAGES } from "@/constants/messages.constants";
import { IAiService } from "@/services/ai-services/interfaces/IAiService";
import { ApiResponse } from "@/utils/apiResponse.utils";




export class AiController implements IAiController {
    constructor(
        private readonly _aiService: IAiService
    ) {}

    async generateEventPoster(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
                    success: false, 
                    message: USER_MESSAGES.USER_INFORMATION_MISSING
                });
                return;
            }

            const body = req.body;

            const dto: GeneratePosterDTO = {
                title: body.title,
                category: body.category,
                description: body.description,
                startDateTime: body.startDateTime,
                locationName: body.locationName
            };

            const posterResult: GeneratePosterResponseDTO = await this._aiService.generateEventPoster(dto);

            res.status(HTTP_STATUS.OK).json(ApiResponse.success<GeneratePosterResponseDTO>(
                "AI Poster generated successfully! You can regenerate or keep this one.",
                // {aiPosterData: posterResult.base64Data}
                // {base64Data: posterResult.base64Data}
                posterResult  // Return the base64 string for live preview
            ));

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: "AI Poster generated successfully! You can regenerate or keep this one.",
            //     aiPosterData: posterResult.base64Data // Return the base64 string for live preview
            // });

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in AiController.generateEventPoster:', msg);
            next(error);
        }
    }
}