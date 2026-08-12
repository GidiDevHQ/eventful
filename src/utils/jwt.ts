import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "@/generated/prisma/enums";

export interface AccessTokenPayload {
    sub: string;
    role: Role;
}

const CONFIG = {
    access: {
        secret: env.jwtAccessSecret,
        expiresIn: env.jwtAccessExpiresIn as SignOptions["expiresIn"],
    },
    refresh: {
        secret: env.jwtRefreshSecret,
        expiresIn: env.jwtRefreshExpiresIn as SignOptions["expiresIn"],
    }
} as const;

export function signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, CONFIG.access.secret, {
        expiresIn: CONFIG.access.expiresIn,
    });
}

export function signRefreshToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, CONFIG.refresh.secret, {
        expiresIn: CONFIG.refresh.expiresIn,
    });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, CONFIG.access.secret) as AccessTokenPayload;
}

// Fixed: Now using CONFIG.refresh.secret instead of access secret
export function verifyRefreshToken(token: string): AccessTokenPayload {
    return jwt.verify(token, CONFIG.refresh.secret) as AccessTokenPayload;
}
