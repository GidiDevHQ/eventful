import { redis } from "@/config/redis";

const DEFAULT_TTL_SECONDS = 60;

export async function cached<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
  const existing = await redis.get(key);
  if (existing !== null) {
    return JSON.parse(existing) as T;
  }

  const value = await loader();
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds || DEFAULT_TTL_SECONDS);
  return value;
}

export async function invalidateByPrefix(prefix: string): Promise<void> {
  const stream = redis.scanStream({ match: `${prefix}*` });
  const keysToDelete: string[] = [];
  for await (const keys of stream) {
    keysToDelete.push(...keys as string[]);
  }
  if (keysToDelete.length > 0) {
    await redis.del(...keysToDelete)
  }
}
