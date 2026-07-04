// backend/src/services/ai-services/implementations/ai.service.ts
import { GeneratePosterDTO, GeneratePosterResponseDTO } from '@/dtos/ai.dto';
import createHttpError from 'http-errors';
import { HTTP_STATUS } from '@/constants/http-status.constants';
import { IAiService } from '@/services/ai-services/interfaces/IAiService';
import { IAiImageProvider } from '@/providers/ai-image-providers/interfaces/IAiImageProvider';




export class AiService implements IAiService {
    constructor(
        private readonly _imageProvider: IAiImageProvider
    ) {}


    async generateEventPoster(data: GeneratePosterDTO): Promise<GeneratePosterResponseDTO> {
        try {
            const prompt: string = this.buildPrompt(data);

            const base64Data: string = await this._imageProvider.generateImage(prompt);
            
            return { base64Data };

        } catch (error: unknown) {
            throw error instanceof createHttpError.HttpError 
                ? error 
                : createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Poster generation failed.");
        }
    }


    private buildPrompt(data: GeneratePosterDTO): string {
        return `Create a high-quality, professional, and modern promotional background poster for an event. 
        Category: ${data.category}. 
        Title/Theme: ${data.title}. 
        Details: ${data.description}. 
        Vibe/Location: ${data.locationName}. 
        Strict requirement: The image must be a clean, aesthetic background illustration or photograph suitable for an event banner. Do NOT include any typography, text, letters, or words in the image.`;
    }


}