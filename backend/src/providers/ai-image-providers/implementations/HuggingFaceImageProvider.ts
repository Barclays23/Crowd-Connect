// backend/src/providers/ai-image-providers/implementations/HuggingFaceImageProvider.ts

import { IAiImageProvider } from "@/providers/ai-image-providers/interfaces/IAiImageProvider";






export class HuggingFaceImageProvider implements IAiImageProvider {
    private readonly apiKey: string = process.env.HF_API_TOKEN || '';
    private readonly modelUrl = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';

    async generateImage(prompt: string): Promise<string> {
        try {
            const response = await fetch(this.modelUrl, {
                headers: { 
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json' 
                },
                method: 'POST',
                body: JSON.stringify({ inputs: prompt }),
            });

            console.log('HuggingFace generateImage response :', response);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("HuggingFace API Error Detail:", errorData);
                throw new Error(`HuggingFace API Error: ${response.statusText}`);
            }

            const contentType = response.headers.get("content-type");

            if (contentType?.includes("application/json")) {
                const json = await response.json();
                throw new Error(`Model not ready: ${JSON.stringify(json)}`);
            }

            const buffer = Buffer.from(await response.arrayBuffer());
            
            return `data:image/jpeg;base64,${buffer.toString('base64')}`;

        } catch (error) {
            console.error("HF Generation Error:", error);
            throw new Error("Failed to generate image via Hugging Face.");
        }
    }
}




// backend/src/providers/ai-image-providers/implementations/HuggingFaceImageProvider.ts
// import { HfInference } from '@huggingface/inference';
// import createHttpError from 'http-errors';
// import { HTTP_STATUS } from '@/constants/http-status.constants';
// import { IAiImageProvider } from '@/providers/ai-image-providers/interfaces/IAiImageProvider';




// export class HuggingFaceImageProvider implements IAiImageProvider {
//     constructor(
//         private readonly _hf: HfInference
//     ) {}

//     async generateImage(prompt: string): Promise<string> {
//         try {
//             console.log(`[HuggingFace AI] Generating image for prompt: ${prompt}`);

//             // You can change the model string to any other text-to-image model on Hugging Face
//             // e.g., 'black-forest-labs/FLUX.1-schnell' or 'stabilityai/stable-diffusion-xl-base-1.0'
//             const response = await this._hf.textToImage({
//                 model       : 'stabilityai/stable-diffusion-xl-base-1.0',
//                 inputs      : prompt,
//                 parameters  : {
//                     negative_prompt: "blurry, low quality, distorted",
//                 }
//             });

//             // Convert Blob to Buffer to Base64
//             const arrayBuffer = await response.arrayBuffer();
//             const buffer = Buffer.from(arrayBuffer);
//             const base64Data = buffer.toString('base64');

//             return `data:image/jpeg;base64,${base64Data}`;

//         } catch (error: unknown) {
//             console.error("HuggingFace Generation Error:", error);
//             throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to generate image via Hugging Face.");
//         }
//     }
// }