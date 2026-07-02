// backend/src/providers/ai-image-providers/implementations/OpenAiImageProvider.ts
import OpenAI from 'openai';
import createHttpError from 'http-errors';
import { HTTP_STATUS } from '@/constants/http-status.constants';
import { IAiImageProvider } from '@/providers/ai-image-providers/interfaces/IAiImageProvider';




export class OpenAiImageProvider implements IAiImageProvider {

    constructor(
        private readonly _openai: OpenAI
    ) {}


    async generateImage(prompt: string): Promise<string> {
        try {
            const response = await this._openai.images.generate({
                model           : "dall-e-3",
                prompt          : prompt,
                n               : 1,
                size            : "1024x1024",
                response_format : "b64_json",
            });

            const base64Data: string | undefined = response.data?.[0]?.b64_json;

            if (!base64Data) {
                throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Image data missing from provider response.");
            }

            if (!base64Data) {
                throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Image data missing from provider response.");
            }

            return `data:image/jpeg;base64,${base64Data}`;

        } catch (error: unknown) {
            console.error("OpenAI Generation Error:", error);
            throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to generate image via OpenAI.");
        }
    }
}