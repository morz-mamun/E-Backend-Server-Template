import { Request } from "express";
import { Types } from "mongoose";

// ─── Auth ──────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

// ─── Request Extensions ────────────────────────────────────────────────────────

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ─── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── API Response ──────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>[];
}

// ─── Blog ──────────────────────────────────────────────────────────────────────

export enum BlogStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export interface IBlogFilter {
  author?: Types.ObjectId;
  status?: BlogStatus;
  tags?: string[];
  search?: string;
}
