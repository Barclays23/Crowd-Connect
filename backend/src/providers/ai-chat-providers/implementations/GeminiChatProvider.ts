// backend/src/providers/ai-image-providers/implementations/GeminiChatProvider.ts
import { IAiChatProvider } from '@/providers/ai-chat-providers/interfaces/IAiChatProvider';
import { GoogleGenAI } from '@google/genai';



export class GeminiAiChatProvider implements IAiChatProvider {
   
   private readonly _genAI: GoogleGenAI;

   constructor() {
      if (!process.env.GEMINI_API_KEY) {
         throw new Error("SYSTEM_ERROR: GEMINI_API_KEY is missing from environment variables.");
      }

      this._genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
   }


   async createEmbedding(userText: string): Promise<number[]> {
      try {
         const result = await this._genAI.models.embedContent({
            // model: 'text-embedding-004',
            model: 'gemini-embedding-001',
            contents: userText
         });
         
         console.log('createEmbedding result by gemini: ', result);
         
         return result.embeddings?.[0]?.values || [];

      } catch (error) {
         console.error("❌ Gemini API Embedding Error:", error);
         throw error; // Re-throw so the service knows it failed
      }
   }



   async generateAnswer(prompt: string): Promise<string> {
      try {
         const response = await this._genAI.models.generateContent({
            // model: 'gemini-2.5-flash',
            model: 'gemini-3.6-flash',
            contents: prompt,
         });

         return response.text || "";
      } catch (error) {
         console.error("❌ Gemini API Generation Error:", error);
         throw error;
      }
   }
}