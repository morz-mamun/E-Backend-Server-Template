import { User } from "../models/User.model";
import { generateTokenPair, verifyRefreshToken } from "./token.service";
import { TokenPair } from "../types";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/AppError";

// ─── Register ─────────────────────────────────────────────────────────────────

export const register = async (
  name: string,
  email: string,
  password: string,
): Promise<{ user: object; tokens: TokenPair }> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ConflictError("Email already registered");

  const user = await User.create({ name, email, password });
  const tokens = generateTokenPair(user.id as string, user.email, user.role);

  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

  return { user: user.toJSON(), tokens };
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = async (
  email: string,
  password: string,
): Promise<{ user: object; tokens: TokenPair }> => {
  const user = await User.findByEmail(email);
  if (!user) throw new UnauthorizedError("Invalid credentials");

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) throw new UnauthorizedError("Invalid credentials");

  const tokens = generateTokenPair(user.id as string, user.email, user.role);
  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

  return { user: user.toJSON(), tokens };
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

export const refreshTokens = async (
  refreshToken: string,
): Promise<TokenPair> => {
  const payload = verifyRefreshToken(refreshToken);

  const user = await User.findById(payload.sub).select("+refreshToken");
  if (!user || user.refreshToken !== refreshToken) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const tokens = generateTokenPair(user.id as string, user.email, user.role);
  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

  return tokens;
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

// ─── Change Password ──────────────────────────────────────────────────────────

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new NotFoundError("User not found");

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) throw new BadRequestError("Current password is incorrect");

  user.password = newPassword;
  await user.save();
};

// ─── Get Profile ──────────────────────────────────────────────────────────────

export const getProfile = async (userId: string): Promise<object> => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");
  return user.toJSON();
};
