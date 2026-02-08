// src/utils/formatZodErrors.ts
import { ZodIssue } from 'zod';


export interface ZodFormError {
  field: string;
  message: string;
}

// Returns only the error messages (no field names)
export const formatZodErrorMessages = (issues: ZodIssue[]): ZodFormError[] => {
  const zodValidationErrors = issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
  
  console.log('zodValidationErrors :', zodValidationErrors);
  return zodValidationErrors;
};
