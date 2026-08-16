import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { redis } from "./config/redis";
import "./jobs/reminderWorker"

async function main() {
    await prisma.$connect();

    console.log("Connected to PostgreSQL");

    redis.on("connect", () => console.log("Connected to redis"));

    app.listen(env.port, () => {
        console.log(`Eventful API is successfully running on http:localhost:${env.port}`);
    })
}

main().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
})