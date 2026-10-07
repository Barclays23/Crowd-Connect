import { IAiChatProvider } from '@/providers/ai-chat-providers/interfaces/IAiChatProvider';
import { GoogleGenAI } from '@google/genai';

// Custom type guard for Gemini API errors
interface GeminiApiError extends Error {
    status?: number;
}

export class GeminiAiChatProvider implements IAiChatProvider {
   constructor(
      private readonly _genAI: GoogleGenAI
   ) {}


   async createEmbedding(userText: string): Promise<number[]> {
      const maxRetries = 2;
      let attempt = 1;

      while (attempt <= maxRetries) {
         try {
            const result = await this._genAI.models.embedContent({
               model: 'gemini-embedding-001',
               contents: userText,
            });

            return result.embeddings?.[0]?.values || [];

         } catch (error: unknown) {
            if (attempt === maxRetries) {
               console.error("❌ Gemini API Embedding Error (Retries exhausted):", error);
               throw error;
            }

            console.warn(`⚠️ Embedding network glitch (Attempt ${attempt}/${maxRetries}). Retrying in 1s...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            attempt++;
         }
      }

      return [];
   }

   async generateAnswer(prompt: string): Promise<string> {
      // Define a fallback chain from the primary model down to highly available backups
      // With the actively supported 3.x Flash tier models:
      const modelsToTry: string[] = [
         'gemini-3.8-flash', // The latest and most capable Flash model
         'gemini-3.7-flash', 
         'gemini-3.6-flash', 
         'gemini-3.5-flash', 
         'gemini-3.5-flash-lite', 
      ];

      const maxRetries: number = 1;
      
      for (const model of modelsToTry) {
         let attempt = 1;
         
         while (attempt <= maxRetries) {
            try {
               const response = await this._genAI.models.generateContent({
                  model: model,
                  contents: prompt,
               });
               
               return response.text || "";
               
            } catch (error: unknown) {
               if (this.isHighDemandError(error)) {
                  if (attempt === maxRetries) {
                     console.warn(`⚠️ ${model} exhausted retries. Falling back to next model...`);
                     break; // Escapes the while loop to proceed to the next model in the fallback chain
                  }
                  
                  // Exponential backoff (2^attempt * 1000ms) with a random jitter offset 
                  // to prevent a "thundering herd" effect where all clients retry simultaneously
                  const delay = (Math.pow(2, attempt) * 1000) + (Math.random() * 500);
                  console.warn(`⚠️ ${model} overloaded (503). Retrying in ${Math.round(delay)}ms...`);
                  
                  await new Promise((resolve) => setTimeout(resolve, delay));
                  attempt++;
                  continue;
               }
               
               // Rethrow standard HTTP client errors (e.g., 400 Bad Request, 401 Unauthorized) immediately
               console.error(`❌ Gemini API Generation Error on ${model}:`, error);
               throw error;
            }
         }
      }
      
      throw new Error("Service Unavailable: All model fallbacks and retries exhausted.");
   }

   // Single-purpose helper method to strictly validate the error signature without using 'any'
   private isHighDemandError(error: unknown): error is GeminiApiError {
      return (
         typeof error === 'object' && 
         error !== null && 
         'status' in error && 
         (error as GeminiApiError).status === 503
      );
   }
}