import rateLimit from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import { redis } from "../config/redis";

export function makeRateLimiter(opt: { windowMs: number; max: number; message: string; prefix: string }) {
    return rateLimit({
        windowMs: opt.windowMs,

        max: opt.max,

        standardHeaders: true,

        legacyHeaders: false,

        message: {
            status: "error", message: opt.message ?? "Too many requests, please try again later."
        },

        store: new RedisStore({
            prefix: opt.prefix,
            sendCommand: async (command: string, ...args: string[]) =>
                (await redis.call(command, ...args)) as RedisReply,
        }),
    });
}

export const generateLimiter = makeRateLimiter({ windowMs: 15 * 60 * 1000, max: 100, message: "Too many requests from this IP, please try again after 15 minutes.", prefix: "rl:global:" });

export const authLimiter = makeRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: "Too many login attempts from this IP, please try again after 15 minutes.", prefix: "rl:auth:" });

export const paymentLimiter = makeRateLimiter({ windowMs: 15 * 60 * 1000, max: 5, message: "Too many payment attempts from this IP, please try again after 15 minutes.", prefix: "rl:payment:" });
