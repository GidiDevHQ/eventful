import { AppError } from "@/utils/AppError";
import { NextFunction, Request, Response } from "express";
import { ZodError, ZodObject } from "zod";

interface ValidatedRequest extends Request {
  validated?: {
    body: unknown;
    query: unknown;
    params: unknown;
  };
}

export function validate(schema: ZodObject<any>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as {
        body: unknown;
        query: unknown;
        params: unknown;
      };

      req.body = parsed.body;
      (req as ValidatedRequest).validated = parsed;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationIssues = error.issues.map((issue) => ({
          field: issue.path.slice().join("."),
          message: issue.message,
        }));

        return next(
          new AppError(
            `Validation error: ${validationIssues
              .map((issue) => issue.message)
              .join(", ")}`,
            400
          )
        );
      }

      next(error);
    }
  };
}