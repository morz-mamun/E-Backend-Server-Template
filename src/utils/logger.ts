import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { env } from "../config/env";

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const fileRotateTransport = new DailyRotateFile({
  dirname: env.log.dir,
  filename: "%DATE%-combined.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  format: combine(timestamp(), errors({ stack: true }), json()),
});

const errorFileTransport = new DailyRotateFile({
  dirname: env.log.dir,
  filename: "%DATE%-error.log",
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "20m",
  maxFiles: "30d",
  format: combine(timestamp(), errors({ stack: true }), json()),
});

export const logger = winston.createLogger({
  level: env.log.level,
  defaultMeta: { service: "production-api" },
  transports: [fileRotateTransport, errorFileTransport],
  exceptionHandlers: [
    new DailyRotateFile({
      dirname: env.log.dir,
      filename: "%DATE%-exceptions.log",
      datePattern: "YYYY-MM-DD",
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      dirname: env.log.dir,
      filename: "%DATE%-rejections.log",
      datePattern: "YYYY-MM-DD",
    }),
  ],
});

if (env.nodeEnv !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), simple()),
    }),
  );
}
