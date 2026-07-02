// backend/src/providers/ai-image-providers/implementations/GeminiImageProvider.ts
import createHttpError from 'http-errors';
import { HTTP_STATUS } from '@/constants/http-status.constants';
import { IAiImageProvider } from "@/providers/ai-image-providers/interfaces/IAiImageProvider";
// generative-ai is lagacy SDK and will be depricated soon
// import { GenerateContentResult, GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";




export class GeminiImageProvider implements IAiImageProvider {

    constructor(
        // private readonly _generativeAI: GoogleGenerativeAI,
        private readonly _genAI: GoogleGenAI
    ) {}



    async generateImage(prompt: string): Promise<string> {
        try {
            const response = await this._genAI.models.generateContent({
                // model   : "gemini-3.1-flash-image",
                // model   : "gemini-2.5-flash-image",
                model   : "gemini-3.1-flash-image",
                contents: prompt,
                config  : {
                    // store: false // Opt-out of Google saving the interaction data
                    responseModalities: ["IMAGE"],
                }
            });

            console.log('GeminiImageProvider generateImage response :', response)

            // The SDK returns the base64 output in the text response for this model
            // const base64Data: string | undefined = response.text;

            // 3. Extract the base64 string from the inlineData object
            const base64Data: string | undefined = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

            if (!base64Data) {
                throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Image data missing from Gemini response.");
            }

            return `data:image/jpeg;base64,${base64Data}`;

        } catch (error: unknown) {
            console.error("Gemini Generation Error:", error);
            throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to generate image via Gemini.");
        }
    }
}