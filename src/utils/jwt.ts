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

// Generate short-lived access tokens used for authenticated API requests.
export function signAccessToken(payload: AccessTokenPayload): string {
    const options: SignOptions = {};
    if (CONFIG.access.expiresIn !== undefined) {
        options.expiresIn = CONFIG.access.expiresIn;
    }
    return jwt.sign(payload, CONFIG.access.secret, options);
}

// Create longer-lived refresh tokens so a user can obtain a new access token without re-entering credentials.
export function signRefreshToken(payload: AccessTokenPayload): string {
    const options: SignOptions = {};
    if (CONFIG.refresh.expiresIn !== undefined) {
        options.expiresIn = CONFIG.refresh.expiresIn;
    }
    return jwt.sign(payload, CONFIG.refresh.secret, options);
}

// Validate access tokens on protected routes and return the embedded user identity.
export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, CONFIG.access.secret) as AccessTokenPayload;
}

// Validate refresh tokens with the refresh secret so rotating or renewing sessions stays isolated from access tokens.
export function verifyRefreshToken(token: string): AccessTokenPayload {
    return jwt.verify(token, CONFIG.refresh.secret) as AccessTokenPayload;
}
