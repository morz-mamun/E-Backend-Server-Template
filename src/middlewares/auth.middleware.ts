import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/token.service";
import { AuthRequest, UserRole } from "../types";
import { UnauthorizedError, ForbiddenError } from "../utils/AppError";
import { sendError } from "../utils/apiResponse";
import { AppError } from "../utils/AppError";

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof AppError) {
      sendError(res, err.message, err.statusCode);
    } else {
      sendError(res, "Authentication failed", 401);
    }
  }
};

export const authorize =
  (...roles: UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, "Insufficient permissions", 403);
      return;
    }

    next();
  };
