import { Request, Response, NextFunction } from "express";
import * as blogService from "../services/blog.service";
import { AuthRequest, BlogStatus, IBlogFilter } from "../types";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";
import { Types } from "mongoose";

export const createBlog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const blog = await blogService.createBlog(
      req.body as Parameters<typeof blogService.createBlog>[0],
      req.user!.sub,
    );
    sendCreated(res, blog, "Blog created");
  } catch (err) {
    next(err);
  }
};

export const getBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit, sort, order, status, tags, search, author } =
      req.query as Record<string, string>;

    const filter: IBlogFilter = {
      ...(status && { status: status as BlogStatus }),
      ...(author && { author: new Types.ObjectId(author) }),
      ...(tags && { tags: Array.isArray(tags) ? tags : [tags] }),
      ...(search && { search }),
    };

    const result = await blogService.getBlogs(filter, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sort,
      order: order as "asc" | "desc" | undefined,
    });

    sendSuccess(res, result, "Blogs retrieved");
  } catch (err) {
    next(err);
  }
};

export const getBlogBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const blog = await blogService.getBlogBySlug(
      req.params.slug as string,
      true,
    );
    sendSuccess(res, blog, "Blog retrieved");
  } catch (err) {
    next(err);
  }
};

export const getBlogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const blog = await blogService.getBlogById(req.params.id as string);
    sendSuccess(res, blog, "Blog retrieved");
  } catch (err) {
    next(err);
  }
};

export const updateBlog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const blog = await blogService.updateBlog(
      req.params.id as string,
      req.user!.sub,
      req.user!.role,
      req.body as Parameters<typeof blogService.updateBlog>[3],
    );
    sendSuccess(res, blog, "Blog updated");
  } catch (err) {
    next(err);
  }
};

export const deleteBlog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await blogService.deleteBlog(
      req.params.id as string,
      req.user!.sub,
      req.user!.role,
    );
    sendNoContent(res);
  } catch (err) {
    next(err);
  }
};
