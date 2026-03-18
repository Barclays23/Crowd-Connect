// backend/src/config/winston-logger.config.ts

import winston from "winston";
import "winston-daily-rotate-file";


// 1. File Transport (JSONL format for the machine)
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: "logs/application-%DATE%.log", // Saves to a /logs folder
  datePattern: "YYYY-MM-DD",
  maxFiles: "2d", // RETENTION PERIOD! (2 days)
  maxSize: "10m",  // Rotates early if a file hits 10 Megabytes
});



// 2. Console Transport (Pretty format for terminal)
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
      }`;
    })
  ),
});




const winstonLogger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // 1. save to logs files with retention period: Keep it as single-line JSON for industry standard log files
    fileRotateTransport,

    // 2. CONSOLE: Make it pretty and readable for you during development!
    consoleTransport
  ],

  exceptionHandlers: [fileRotateTransport, consoleTransport],
  rejectionHandlers: [fileRotateTransport, consoleTransport],
});



export default winstonLogger;


