import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { sendError } from "../utils/apiResponse";

type ValidationTarget = "body" | "query" | "params";

export const validate =
  (schema: Joi.ObjectSchema, target: ValidationTarget = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/['"]/g, ""),
      }));

      sendError(
        res,
        "Validation failed",
        422,
        errors as Record<string, string>[],
      );
      return;
    }

    req[target] = value;
    next();
  };
