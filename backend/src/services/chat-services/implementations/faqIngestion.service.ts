// backend/src/services/chat-services/implementations/chat.service.ts
import { IFaqKnowledgeRepository } from "@/repositories/interfaces/IFaqKnowledgeRepository";
import { TermsSettingsEntity } from "@/entities/platformSettings.entity";
import { createHttpError } from "@/utils/httpError.utils";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { IAiChatProvider } from "@/providers/ai-chat-providers/interfaces/IAiChatProvider";
import { CreateFaqKnowledgeInput } from "@/types/faqKnowledge.types";



export class FaqIngestionService {
    constructor(
        private readonly _faqKnowledgeRepo: IFaqKnowledgeRepository,
        private readonly _aiChatProvider: IAiChatProvider
    ) {}

    /*
     * Extracts T&C arrays from the platform settings, generates vectors, 
     * and refreshes the entire vector database.
     * Re-indexes only the Terms & Conditions into vector embeddings for the Chatbot.
     */
    async reindexTermsKnowledgeBase(termsData: TermsSettingsEntity): Promise<void> {
        try {
            // 1. Gather all terms from the settings
            const allTerms: string[] = [
            ...(termsData.generalTerms || []),
            ...(termsData.bookingTerms || []),
            ...(termsData.cancellationTerms || []),
            ...(termsData.hostTerms || []),
            ...(termsData.reviewTerms || []),
            ];

            // Filter out empty strings to prevent wasting API calls
            const validChunks: string[] = allTerms.filter(
                (chunk: string) => chunk.trim().length > 10
            );

            if (validChunks.length === 0) {
                return; // Nothing to ingest
            }

            const databaseRecords: CreateFaqKnowledgeInput[] = [];

            // 2. Generate embeddings for each chunk
            for (const chunk of validChunks) {
                const embedding: number[] = await this._aiChatProvider.createEmbedding(chunk);
                
                databaseRecords.push({
                    content: chunk,
                    embedding: embedding,
                    sourceDocument: "Platform_Terms_And_Conditions",
                });
            }

            // 3. Purge the old knowledge base to prevent duplicate/stale answers
            await this._faqKnowledgeRepo.clearKnowledgeBase();

            // 4. Save new vectors to MongoDB
            await this._faqKnowledgeRepo.saveKnowledgeChunks(databaseRecords);

        } catch (error: unknown) {
            console.error("Ingestion Error:", error);
            throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to ingest terms into the AI knowledge base.");
        }
    }
}