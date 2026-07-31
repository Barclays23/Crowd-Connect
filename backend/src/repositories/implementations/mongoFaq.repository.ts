// backend/src/repositories/implementations/mongoFaq.repository.ts
import FaqKnowledge from "@/models/implementations/faqKnowledge.model";
import { BaseRepository } from "@/repositories/base.repository";
import { IFaqKnowledgeRepository } from "@/repositories/interfaces/IFaqKnowledgeRepository";
import { IFaqKnowledgeModel, VectorSearchResult } from "@/types/faqKnowledge.types";




export class MongoFaqRepository extends BaseRepository<IFaqKnowledgeModel> implements IFaqKnowledgeRepository {
   constructor() {
      super(FaqKnowledge);
   }


   async findSimilarContext(queryEmbedding: number[], limit: number = 3): Promise<string[]> {
      // This uses MongoDB Atlas Vector Search
      const results: VectorSearchResult[] = await this.model.aggregate<VectorSearchResult>([
         {
         $vectorSearch: {
            index: "vector_index",      // Name of the Atlas Vector Search index
            path: "embedding", 
            queryVector: queryEmbedding,
            numCandidates: 10,
            limit: limit,
         }
         },
         {
            $project: {
               content: 1,
               _id: 0
            }
         }
      ]);

      return results.map((doc: VectorSearchResult) => doc.content);
   }


   async saveKnowledgeChunks(chunks: Partial<IFaqKnowledgeModel>[]): Promise<void> {
      await this.model.insertMany(chunks);
   }

   async clearKnowledgeBase(): Promise<void> {
      await this.model.deleteMany({});
   }


}