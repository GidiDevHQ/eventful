import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";

const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
});

declare global {
    var __prisma: PrismaClient | undefined;
}

// Keep a single Prisma client in development to avoid reconnect churn during hot reloads.
export const prisma =
    global.__prisma ??
    new PrismaClient({
        adapter,
        log: env.nodeEnv === "development" ? ["warn", "error"] : ["error"],
    });

if (env.nodeEnv === "development") {
    global.__prisma = prisma;
}