import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Throw error if required environment variables are missing
const requiredEnvVars = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

// Define environment variables
export const env = {
  nodeEnv: (process.env.NODE_ENV ?? "development") as string,
  port: parseInt(process.env.PORT ?? "5000", 10),
  apiVersion: process.env.API_VERSION ?? "v1",
  mongoUri: requiredEnvVars("MONGODB_URI"),

  jwt: {
    accessTokenSecret: requiredEnvVars("JWT_ACCESS_TOKEN_SECRET"),
    refreshTokenSecret: requiredEnvVars("JWT_REFRESH_TOKEN_SECRET"),
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? "1d",
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ?? "7d",
  },

  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "12", 10),

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "900000", 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX ?? "100", 10), // limit each IP to 100 requests per windowMs (15 minutes)
  },

  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") ?? [
    "http://localhost:3000",
    "http://localhost:5173",
  ],

  log: {
    level: process.env.LOG_LEVEL ?? "info",
    dir: process.env.LOG_DIR ?? "logs",
  },
};
