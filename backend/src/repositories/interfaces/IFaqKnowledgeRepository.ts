// backend/src/repositories/interfaces/IFaqKnowledgeRepository.ts

import { CreateFaqKnowledgeInput } from "@/types/faqKnowledge.types";


export interface IFaqKnowledgeRepository {
  findSimilarContext(queryEmbedding: number[], limit?: number): Promise<string[]>;
  saveKnowledgeChunks(chunks: CreateFaqKnowledgeInput[]): Promise<void>;
  clearKnowledgeBase(): Promise<void>;
}