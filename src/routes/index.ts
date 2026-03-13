import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";
import blogRoutes from "./blog.routes";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the API v1",
  });
});

router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.use("/auth", authRoutes);
router.use("/blogs", blogRoutes);

export default router;
