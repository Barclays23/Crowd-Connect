// backend/src/models/implementations/faqKnowledge.model.ts
import mongoose, { model, Model, Schema } from "mongoose";
import { IFaqKnowledgeModel } from "@/types/faqKnowledge.types";




const faqKnowledgeSchema = new Schema<IFaqKnowledgeModel>(
    {
        content: { 
            type: String, 
            required: true 
        },
        embedding: { 
            type: [Number], 
            required: true 
        },
        sourceDocument: { 
            type: String, 
            required: true 
        },
    },
    { 
        timestamps: true 
    }
);

const FaqKnowledge: Model<IFaqKnowledgeModel> = model<IFaqKnowledgeModel>("FaqKnowledge", faqKnowledgeSchema);
export default FaqKnowledge;