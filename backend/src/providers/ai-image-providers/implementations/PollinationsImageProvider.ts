// backend/src/providers/ai-image-providers/implementations/PollinationsImageProvider.ts
import createHttpError from 'http-errors';
import { HTTP_STATUS } from '@/constants/http-status.constants';
import { IAiImageProvider } from '@/providers/ai-image-providers/interfaces/IAiImageProvider';



export class PollinationsImageProvider implements IAiImageProvider {
    async generateImage(prompt: string): Promise<string> {
        try {
            console.log(`[Pollinations AI] Generating REAL image for prompt: ${prompt}`);
            
            // Pollinations is a free AI image generator that requires no API keys.
            // We request a 16:9 landscape image (1024x576) suitable for event banners.
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=576&nologo=true`;

            // Fetch the raw image data from the AI
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`AI API responded with status: ${response.status}`);
            }

            // Convert the raw image data into a Base64 string
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64Data = buffer.toString('base64');

            // Return it exactly how the frontend expects it
            return `data:image/jpeg;base64,${base64Data}`;
            
        } catch (error: unknown) {
            console.error("AI Generation Error:", error);
            throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to generate real AI image.");
        }
    }
}