export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly cause?: unknown;
    
    constructor(message: string, statusCode = 400, cause?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.cause = cause;

        Error.captureStackTrace(this, this.constructor);
    }
}

import { NextFunction, Request, Response } from "express";

type AsyncHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<unknown>;

export function catchAsync(fn: AsyncHandler) {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
}