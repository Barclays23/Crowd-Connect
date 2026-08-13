// backend/src/services/profanity-services/implementations/GeminiProfanityFilterService.ts
import { IProfanityFilterService } from "../interfaces/IProfanityFilterService";
import { GoogleGenAI } from '@google/genai';




export class GeminiProfanityFilterService implements IProfanityFilterService {
    
    constructor(
        private readonly _genAI: GoogleGenAI
    ) {}


    async isProfane(text: string): Promise<boolean> {
        try {
            console.log('checking profanity using Gemini SDK.....')
            const prompt = `
                You are a content moderation AI for an event booking platform. 
                Analyze the following user review. Does it contain severe hate speech, extreme vulgarity, or highly offensive language? 
                Ignore mild everyday words like 'damn', 'crap', or 'hell'. 
                Reply ONLY with the exact word "TRUE" if it is highly offensive, or "FALSE" if it is acceptable.
                
                Review: "${text}"
            `;

            const response = await this._genAI.models.generateContent({
                model: 'gemini-3.6-flash',
                contents: prompt,
            });

            const result = response.text?.trim().toUpperCase() || "FALSE";
            
            if (result === "TRUE") {
                console.log(`\n⚠️ GEMINI PROFANITY FILTER CAUGHT: "${text}"\n`);
            }

            return result === "TRUE";

        } catch (error) {
            console.error("Gemini Profanity Filter Error:", error);
            throw new Error("Our content moderation service is temporarily unavailable. Please try submitting your review again in a moment.");
        }
    }
}