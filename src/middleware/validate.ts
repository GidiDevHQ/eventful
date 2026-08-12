import { AppError } from "@/utils/AppError";
import { NextFunction, Request, Response } from "express";
import { ZodError, ZodObject } from "zod";

export function validate(schema: ZodObject<any>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsed.body;
      req.query = parsed.query as typeof req.query;
      req.params = parsed.params as typeof req.params;

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