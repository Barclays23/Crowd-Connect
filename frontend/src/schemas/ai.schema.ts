// frontend/src/schemas/ai.schema.ts
import { z } from "zod";
import { 
    titleBase, 
    categoryBase, 
    descriptionBase, 
    locationNameBase, 
    dateBase, 
    timeBase 
} from "./event.schema";
import { parseISODateTime } from "@/utils/dateAndTimeFormats";




export const generatePosterSchema = z.object({
    title: titleBase,
    category: categoryBase,
    description: descriptionBase,
    startDate: dateBase("Start"),
    startTime: timeBase("Start"),
    locationName: locationNameBase
}).superRefine((data, ctx) => {
    // Validate that the combined date/time is valid
    const start = parseISODateTime(data.startDate, data.startTime);
    
    if (isNaN(start.getTime())) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Valid start date and time are required for AI generation",
            path: ["startDate"],
        });
    }
});


export type GeneratePosterValues = z.infer<typeof generatePosterSchema>;