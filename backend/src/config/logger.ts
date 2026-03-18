// backend/src/config/logger.ts

import winston from "winston";
import "winston-daily-rotate-file";



const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: "logs/application-%DATE%.log", // Saves to a /logs folder
  datePattern: "YYYY-MM-DD",
  maxFiles: "2d", // RETENTION PERIOD! (2 days)
  maxSize: "10m",  // Rotates early if a file hits 10 Megabytes
});




const winstonLogger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(), // print to terminal
    fileRotateTransport               // Also save to files with retention period
  ],

  exceptionHandlers: [fileRotateTransport, new winston.transports.Console()],
  rejectionHandlers: [fileRotateTransport, new winston.transports.Console()],
});



export default winstonLogger;


