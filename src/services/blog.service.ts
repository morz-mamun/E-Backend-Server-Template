import { Types } from "mongoose";
import { Blog } from "../models/Blog.model";
import {
  BlogStatus,
  IBlogFilter,
  PaginatedResult,
  PaginationQuery,
} from "../types";
import { ForbiddenError, NotFoundError } from "../utils/AppError";
import { UserRole } from "../types";

// ─── Create ───────────────────────────────────────────────────────────────────

export const createBlog = async (
  data: {
    title: string;
    content: string;
    excerpt: string;
    tags?: string[];
    coverImage?: string;
    status?: BlogStatus;
  },
  authorId: string,
) => {
  const blog = await Blog.create({ ...data, author: authorId });
  await blog.populate("author", "name email");
  return blog;
};

// ─── Get All (paginated) ──────────────────────────────────────────────────────

export const getBlogs = async (
  filter: IBlogFilter,
  pagination: PaginationQuery,
): Promise<PaginatedResult<object>> => {
  const {
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "desc",
  } = pagination;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};

  if (filter.status) query.status = filter.status;
  if (filter.author) query.author = filter.author;
  if (filter.tags?.length) query.tags = { $in: filter.tags };
  if (filter.search) {
    query.$text = { $search: filter.search };
  }

  const [blogs, total] = await Promise.all([
    Blog.find(query)
      .populate("author", "name email")
      .sort({ [sort]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: blogs,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

// ─── Get One ──────────────────────────────────────────────────────────────────

export const getBlogBySlug = async (slug: string, incrementView = false) => {
  const query = Blog.findOne({ slug }).populate("author", "name email");
  if (incrementView) {
    return Blog.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true },
    )
      .populate("author", "name email")
      .select("+views");
  }
  const blog = await query;
  if (!blog) throw new NotFoundError("Blog not found");
  return blog;
};

export const getBlogById = async (id: string) => {
  const blog = await Blog.findById(id).populate("author", "name email");
  if (!blog) throw new NotFoundError("Blog not found");
  return blog;
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateBlog = async (
  blogId: string,
  userId: string,
  userRole: UserRole,
  data: Partial<{
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    coverImage: string;
    status: BlogStatus;
  }>,
) => {
  const blog = await Blog.findById(blogId);
  if (!blog) throw new NotFoundError("Blog not found");

  const isOwner = blog.author.toString() === userId;
  const isAdmin = userRole === UserRole.ADMIN;
  if (!isOwner && !isAdmin)
    throw new ForbiddenError("You cannot edit this blog");

  Object.assign(blog, data);
  await blog.save();
  await blog.populate("author", "name email");
  return blog;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteBlog = async (
  blogId: string,
  userId: string,
  userRole: UserRole,
): Promise<void> => {
  const blog = await Blog.findById(blogId);
  if (!blog) throw new NotFoundError("Blog not found");

  const isOwner = blog.author.toString() === userId;
  const isAdmin = userRole === UserRole.ADMIN;
  if (!isOwner && !isAdmin)
    throw new ForbiddenError("You cannot delete this blog");

  await blog.deleteOne();
};
