import { Router } from "express";
import * as blogController from "../controllers/blog.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createBlogSchema,
  updateBlogSchema,
  blogQuerySchema,
} from "../validators/blog.validator";

const router = Router();

// Public routes
router.get("/", validate(blogQuerySchema, "query"), blogController.getBlogs);
router.get("/slug/:slug", blogController.getBlogBySlug);
router.get("/:id", blogController.getBlogById);

// Protected routes
router.use(authenticate);
router.post("/", validate(createBlogSchema), blogController.createBlog);
router.patch("/:id", validate(updateBlogSchema), blogController.updateBlog);
router.delete("/:id", blogController.deleteBlog);

export default router;
