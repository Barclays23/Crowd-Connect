// backend/src/config/morgan.ts

import morgan, { StreamOptions } from "morgan";
import { Request, Response } from "express";
import winstonLogger from "./winston-logger.config";



// Create a stream object that tells Morgan to use Winston for writing logs
const stream: StreamOptions = {
  // Use the 'http' severity level. If you don't have an 'http' level in your 
  // winston setup, 'info' works perfectly too.
  write: (message: string) => winstonLogger.info(message.trim()),
};





// Skip logging HTTP requests in test environments OR if the request is an error
const skip = (req: Request, res: Response) => {
  const env = process.env.NODE_ENV || "development";
  
  // 1. Always skip in automated test environment
  if (env === "test") return true;

  // 2. Skip Morgan logging if status is 400 or higher (Errors)
  // This prevents the "Double Log" because your Error Middleware 
  // already logs these with full detail/stack traces.
  return res.statusCode >= 400; 
};



// Build the morgan middleware
const morganMiddleware = morgan(
  // The format string. 'dev' is colorful for the console, 
  // 'combined' is standard Apache format for files. 
  // We'll use a custom format that's easy to read:
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);

export default morganMiddleware;