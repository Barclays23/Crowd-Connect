// backend/src/providers/ai-image-providers/implementations/FalImageProvider.ts

import { fal, Result } from "@fal-ai/client";
import createHttpError from 'http-errors';
import { HTTP_STATUS } from '@/constants/http-status.constants';
import { IAiImageProvider } from "@/providers/ai-image-providers/interfaces/IAiImageProvider";
import { FluxProNewOutput } from "@fal-ai/client/endpoints";




export class FalImageProvider implements IAiImageProvider {
    
    // The @fal-ai/client automatically initializes using process.env.FAL_KEY
    // so we don't need to pass credentials explicitly in the constructor.

    async generateImage(prompt: string): Promise<string> {
        try {
            console.log(`[Fal.ai] Ingesting request for model: fal-ai/flux-pro/v1.1`);
            console.log(`[Fal.ai] Generating Flux 1.1 Pro image for: ${prompt}`);
            
            // Send the request to the Flux 1.1 Pro queue
            const result: Result<FluxProNewOutput> = await fal.subscribe("fal-ai/flux-pro/v1.1", {
                input: {
                    prompt           : prompt,
                    image_size       : "landscape_16_9",
                    output_format    : "jpeg",
                    safety_tolerance : "5" // Setting tolerance to 5 prevents the API from aggressively blocking standard event keywords
                },
                logs: false // Disable console noise in production logs
            });

            const imageUrl: string = result.data?.images?.[0]?.url;

            if (!imageUrl) {
                throw new Error("Target image URL missing from fal.ai response object.");
            }

            // Flux returns a hosted URL. Because your frontend expects a Base64 string,
            // Convert the hosted URL to a Base64 Data URL to safely match your form DTO
            const imageResponse: Response       = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error(`Failed to stream image payload from storage mirror: ${imageResponse.statusText}`);
            }

            const arrayBuffer: ArrayBuffer      = await imageResponse.arrayBuffer();
            const buffer: Buffer<ArrayBuffer>   = Buffer.from(arrayBuffer);
            const base64Data: string            = buffer.toString('base64');

            return `data:image/jpeg;base64,${base64Data}`;
            
        } catch (error: unknown) {
            console.error("Fal.ai Generation Pipeline Failure:", error);
            throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to generate image via Fal.ai.");
        }
    }
}