import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { JwtPayload, TokenPair, UserRole } from "../types";
import { UnauthorizedError } from "../utils/AppError";

export const generateTokenPair = (
  userId: string,
  email: string,
  role: UserRole,
): TokenPair => {
  const payload: Omit<JwtPayload, "iat" | "exp"> = { sub: userId, email, role };

  const accessToken = jwt.sign(payload, env.jwt.accessTokenSecret, {
    expiresIn: env.jwt.accessTokenExpiresIn,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, env.jwt.refreshTokenSecret, {
    expiresIn: env.jwt.refreshTokenExpiresIn,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.jwt.accessTokenSecret) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Access token expired");
    }
    throw new UnauthorizedError("Invalid access token");
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.jwt.refreshTokenSecret) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Refresh token expired");
    }
    throw new UnauthorizedError("Invalid refresh token");
  }
};
