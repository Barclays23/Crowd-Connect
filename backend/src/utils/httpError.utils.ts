// backend/src/utils/httpError.utils.ts

class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, errorMessage: string) {
    super(errorMessage);
    this.statusCode = statusCode;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export const createHttpError = (statusCode: number, errorMessage: string) => {
    return new HttpError(statusCode, errorMessage);
}