// backend/src/schemas/ai.schema.ts

import { z } from "zod";
import { 
    titleBase, 
    categoryBase, 
    descriptionBase, 
    locationNameBase 
} from "@/schemas/event.schema";



export const GeneratePosterSchema = z.object({
    title: titleBase,
    category: categoryBase,
    description: descriptionBase,
    
    // We only need the start date for context, not the strict start/end validation
    startDateTime: z.string().datetime({ offset: true, message: "Invalid ISO datetime format" }),
    
    // Location is helpful for AI context, but might be empty for online events
    locationName: locationNameBase, 
});


export type GeneratePosterInput = z.infer<typeof GeneratePosterSchema>;