// backend/src/services/profanity-services/implementations/OpenAIProfanityFilterService.ts
import axios from "axios";
import { IProfanityFilterService } from "../interfaces/IProfanityFilterService";
import OpenAI from "openai";




export class OpenAIProfanityFilterService implements IProfanityFilterService {
    // private apiUrl      = "https://api.openai.com/v1/chat/completions";
    private llmModel    = "gpt-4o-mini"; // Fast and cheap

    constructor(
        private readonly _openAi: OpenAI
    ) {}



    async isProfane(text: string): Promise<boolean> {
        if (!text) return false;

        try {
            const prompt = `
                You are a content moderation AI. Analyze the following user review. 
                Does it contain severe hate speech, extreme vulgarity, or highly offensive language? 
                Ignore mild everyday words like 'damn', 'crap', or 'hell'. 
                Reply ONLY with the exact word "TRUE" if it is highly offensive, or "FALSE" if it is acceptable.
            `;

            const response = await this._openAi.chat.completions.create({
                model       : this.llmModel,
                messages    : [
                    { role: "system", content: prompt },
                    { role: "user", content: text }
                ],
                max_tokens  : 5,
                temperature : 0.0 // Strict, deterministic output
            });

            const result: string = response.choices[0].message.content?.trim().toUpperCase() || "FALSE";
            
            if (result === "TRUE") {
                console.log(`\n⚠️ OPENAI PROFANITY FILTER CAUGHT: "${text}"\n`);
            }

            return result === "TRUE";

        } catch (error) {
            console.error("OpenAI Profanity Filter Error:", error);
            return false; // Fail-open
        }
    }
}