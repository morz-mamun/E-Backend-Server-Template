import Joi from "joi";
import { BlogStatus } from "../types";

export const createBlogSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  content: Joi.string().min(50).required(),
  excerpt: Joi.string().max(500).required(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).default([]),
  coverImage: Joi.string().uri().optional(),
  status: Joi.string()
    .valid(...Object.values(BlogStatus))
    .default(BlogStatus.DRAFT),
});

export const updateBlogSchema = Joi.object({
  title: Joi.string().min(5).max(200),
  content: Joi.string().min(50),
  excerpt: Joi.string().max(500),
  tags: Joi.array().items(Joi.string().max(50)).max(10),
  coverImage: Joi.string().uri().allow(null),
  status: Joi.string().valid(...Object.values(BlogStatus)),
}).min(1);

export const blogQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string()
    .valid("createdAt", "updatedAt", "title", "views")
    .default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),
  status: Joi.string().valid(...Object.values(BlogStatus)),
  tags: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
  search: Joi.string().max(200),
  author: Joi.string().hex().length(24),
});
