import Redis from "ioredis";
import { env } from "./env"

export const redis = new Redis(env.redisUrl, {
    maxRetriesPerRequest: null,
});

redis.on("error", (err) => {
    console.error("[redis] Error connecting to Redis:", err.message);
})