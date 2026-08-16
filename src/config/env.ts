import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(4000),

    DATABASE_URL: z.url("DATABASE_URL must be a valid URL string"),
    REDIS_URL: z.url("REDIS_URL must be a valid URL string"),

    JWT_ACCESS_SECRET: z.string().min(8, "Access secret should be at least 8 characters"),
    JWT_REFRESH_SECRET: z.string().min(8, "Refresh secret should be at least 8 characters"),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

    PAYSTACK_SECRET_KEY: z.string(),
    PAYSTACK_BASE_URL: z.url().default("https://paystack.co"),

    APP_BASE_URL: z.url().default("http://localhost:4000"),
    FRONTEND_BASE_URL: z.url().default("http://localhost:5173")
});

// Fail fast during startup so missing configuration is caught before any DB or auth logic runs.
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("Invalid environment variables:");

    console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
    process.exit(1);
}

export const env = {
    nodeEnv: parsedEnv.data.NODE_ENV,
    port: parsedEnv.data.PORT,

    databaseUrl: parsedEnv.data.DATABASE_URL,
    redisUrl: parsedEnv.data.REDIS_URL,

    jwtAccessSecret: parsedEnv.data.JWT_ACCESS_SECRET,
    jwtRefreshSecret: parsedEnv.data.JWT_REFRESH_SECRET,
    jwtAccessExpiresIn: parsedEnv.data.JWT_ACCESS_EXPIRES_IN,
    jwtRefreshExpiresIn: parsedEnv.data.JWT_REFRESH_EXPIRES_IN,

    paystackSecretKey: parsedEnv.data.PAYSTACK_SECRET_KEY,
    paystackBaseUrl: parsedEnv.data.PAYSTACK_BASE_URL,

    appBaseUrl: parsedEnv.data.APP_BASE_URL,
    frontendBaseUrl: parsedEnv.data.FRONTEND_BASE_URL,
} as const;