// src/utils/formatZodErrors.ts
import { ZodIssue } from 'zod';


// Returns only the error messages (no field names)
export const formatZodErrorMessages = (issues: ZodIssue[]): string[] => {
  return issues.map((issue) => {   
    const msg = issue.message;
    const formattedZodMessages = msg.charAt(0).toUpperCase() + msg.slice(1);
    console.log('formattedZodMessages :', formattedZodMessages);
    return formattedZodMessages;
  });
};
