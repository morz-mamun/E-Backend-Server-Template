import { Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../types";
import { sendSuccess, sendCreated } from "../utils/apiResponse";
import { BadRequestError } from "../utils/AppError";

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };
    const result = await authService.register(name, email, password);
    sendCreated(res, result, "Registration successful");
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authService.login(email, password);
    sendSuccess(res, result, "Login successful");
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body as { refreshToken: string };
    const tokens = await authService.refreshTokens(token);
    sendSuccess(res, tokens, "Token refreshed");
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user?.sub) throw new BadRequestError("User not found");
    await authService.logout(req.user.sub);
    sendSuccess(res, null, "Logged out successfully");
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await authService.getProfile(req.user!.sub);
    sendSuccess(res, user, "Profile retrieved");
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };
    await authService.changePassword(
      req.user!.sub,
      currentPassword,
      newPassword,
    );
    sendSuccess(res, null, "Password changed successfully");
  } catch (err) {
    next(err);
  }
};
