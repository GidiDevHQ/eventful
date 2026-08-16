import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@/generated/prisma/enums";
import { AppError } from "@/utils/AppError";
import { verifyAccessToken } from "@/utils/jwt";

declare global {
    namespace Express {
        interface Request {
            user?: { id: string, role: Role }
        }
    }
}

// Enforce JWT-based access for protected routes and attach the authenticated user payload to the request.
export function requireAuth(req: Request, _res: Response, next: NextFunction){
    const header = req.headers.authorization;

    if (typeof header !== "string" || !header?.startsWith("Bearer ")) {
        return next(new AppError("Authentication is required", 401));
    }

    const [, token ]= header.split(" ");

    if (!token) {
        return next(new AppError("Invalid authorization header", 401));
    }

    try {
        const payload = verifyAccessToken(token);
        req.user = { id: payload.sub, role: payload.role };
        next();
    } catch (error){
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AppError("Access token has expired", 401, { cause: "TOKEN_EXPIRED" }));
        }
        return next(new AppError("Invalid access token", 401, { cause: "INVALID_TOKEN" }));
    }
}

// Restrict a route to one or more allowed user roles, such as CREATOR or EVENTEE.
export function requireRole(...roles: Role[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError("Authentication is required", 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to perform this action", 403))
        }

        next();
    };
}