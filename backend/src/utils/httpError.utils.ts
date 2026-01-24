// backend/src/utils/httpError.utils.ts

export class HttpError extends Error {
  // Use public for clarity, and ensure it matches the middleware logic
  public readonly statusCode: number;

  constructor(statusCode: number, errorMessage: string) {
    super(errorMessage);
    this.statusCode = statusCode;
    this.name = this.constructor.name; // Set name to "HttpError"
    Error.captureStackTrace?.(this, this.constructor);
  }
}



export const createHttpError = (statusCode: number, errorMessage: string) => {
  return new HttpError(statusCode, errorMessage);
}