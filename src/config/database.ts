import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
  autoIndex: env.nodeEnv !== "production",
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongoUri, MONGOOSE_OPTIONS);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection failed", { error });
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB error", { err });
});
