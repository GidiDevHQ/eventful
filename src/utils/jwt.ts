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
    const options: SignOptions = {};
    if (CONFIG.access.expiresIn !== undefined) {
        options.expiresIn = CONFIG.access.expiresIn;
    }
    return jwt.sign(payload, CONFIG.access.secret, options);
}

export function signRefreshToken(payload: AccessTokenPayload): string {
    const options: SignOptions = {};
    if (CONFIG.refresh.expiresIn !== undefined) {
        options.expiresIn = CONFIG.refresh.expiresIn;
    }
    return jwt.sign(payload, CONFIG.refresh.secret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, CONFIG.access.secret) as AccessTokenPayload;
}

// Fixed: Now using CONFIG.refresh.secret instead of access secret
export function verifyRefreshToken(token: string): AccessTokenPayload {
    return jwt.verify(token, CONFIG.refresh.secret) as AccessTokenPayload;
}
