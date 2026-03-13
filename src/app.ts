import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import { env } from "./config/env";
import { logger } from "./utils/logger";
import routes from "./routes";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.middleware";

export const createApp = (): Application => {
  const app = express();

  // ─── Security Headers ──────────────────────────────────────────────────────
  app.use(helmet());

  // ─── CORS ──────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // ─── Rate Limiting ─────────────────────────────────────────────────────────
  app.use(
    rateLimit({
      windowMs: env.rateLimit.windowMs,
      max: env.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests, please try again later",
      },
    }),
  );

  // ─── Body Parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));
  app.use(cookieParser());

  // ─── Security ──────────────────────────────────────────────────────────────
  app.use(mongoSanitize());
  app.use(compression());

  // ─── Request Logging ───────────────────────────────────────────────────────
  if (env.nodeEnv !== "test") {
    app.use(
      morgan("combined", {
        stream: { write: (msg) => logger.http(msg.trim()) },
        skip: (req) => req.url === "/health",
      }),
    );
  }

  // ─── Trust Proxy (for reverse proxy / load balancer) ──────────────────────
  app.set("trust proxy", 1);

  // ─── API Routes ────────────────────────────────────────────────────────────
  app.use(`/api/${env.apiVersion}`, routes);

  // ─── 404 Handler ──────────────────────────────────────────────────────────
  app.use(notFoundHandler);

  // ─── Global Error Handler ──────────────────────────────────────────────────
  app.use(globalErrorHandler);

  return app;
};
