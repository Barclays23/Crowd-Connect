// backend/src/services/chat-services/implementations/chat.service.ts
import { IChatService } from "@/services/chat-services/interfaces/IChatService";
import { ChatResponseDTO } from "@/dtos/chat.dto";
import { createHttpError } from "@/utils/httpError.utils";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { IAiChatProvider } from "@/providers/ai-chat-providers/interfaces/IAiChatProvider";
import { IFaqKnowledgeRepository } from "@/repositories/interfaces/IFaqKnowledgeRepository";




export class ChatService implements IChatService {
   constructor(
      private readonly _faqRepository: IFaqKnowledgeRepository,
      private readonly _chatProvider: IAiChatProvider // e.g., Gemini or Grok provider
   ) {}


   async generateAnswer(userText: string): Promise<ChatResponseDTO> {
      try {
         console.log('userText :', userText);

         // 1. Turn the user's question/text into numbers (embedding)
         const questionEmbedding = await this._chatProvider.createEmbedding(userText);

         // 2. Retrieve the most relevant rules from vector database
         const relevantChunks = await this._faqRepository.findSimilarContext(questionEmbedding);
         
         if (relevantChunks.length === 0) {
            return { answer: "I'm sorry, I couldn't find any information regarding that in our policies." };
         }

         // const contextText = relevantChunks.join("\n\n");
         const contextText = relevantChunks.length > 0 
             ? relevantChunks.join("\n\n") 
             : "No specific policy documents were found for this query.";

         // 3. Create the prompt for the AI (The "Open Book" test)
         const prompt = `You are the official customer support AI for CrowdConnect, an event booking platform.

         SYSTEM INSTRUCTIONS:
         1. GREETINGS & CASUAL CHAT: If the user provides a standard greeting (e.g., "hi", "hello", "help", "who are you"), respond naturally, warmly, and concisely. Introduce yourself as the CrowdConnect assistant and ask how you can help with their event bookings or policies.
         2. POLICY QUESTIONS: If the user asks a specific question about platform rules, refunds, or terms, you MUST answer strictly using ONLY the provided CONTEXT below.
         3. MISSING INFO: If the user asks a specific platform/policy question and the CONTEXT does not contain the answer, gracefully state: "I'm sorry, I couldn't find specific information regarding that in our current policies." DO NOT hallucinate or invent rules.
         
         CONTEXT: 
         ${contextText}
         
         USER INPUT: 
         ${userText}`;

         // 4. Generate the final answer
         const answer = await this._chatProvider.generateText(prompt);

         console.log('answer done')

         return { answer };


      } catch (error: unknown) {
         console.error("❌ ChatService Error:", error);
         throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to generate answer");
      }
   }
}