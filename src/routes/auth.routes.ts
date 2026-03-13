import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from "../validators/auth.validator";

const router = Router();

// Public routes

router.post("/register", validate(registerSchema), authController.register);

router.post("/login", validate(loginSchema), authController.login);

router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken,
);

// Protected routes
router.use(authenticate);

router.post("/logout", authController.logout);

router.get("/me", authController.getProfile);

router.patch(
  "/change-password",
  validate(changePasswordSchema),
  authController.changePassword,
);

export default router;
