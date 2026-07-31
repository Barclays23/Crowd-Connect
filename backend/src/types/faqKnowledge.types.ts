// backend/src/types/faqKnowledge.types.ts
import { Document } from "mongoose";


export interface IFaqKnowledgeModel extends Document {
    content: string;
    embedding: number[];
    sourceDocument: string;
    createdAt: Date;
    updatedAt: Date;
}




// for inserting the FAQ vector knowledge
export interface CreateFaqKnowledgeInput {
    content: string;
    embedding: number[];
    sourceDocument: string;
}



export interface VectorSearchResult {
    content: string;
}



export interface VectorSearchResult {
    content: string;
}



export interface CreateFaqKnowledgeInput {
    content: string;
    embedding: number[];
    sourceDocument: string;
}