import { randomBytes } from "node:crypto";

// Build a URL-safe slug from a title while adding a short random suffix to avoid collisions.
export function slugify(title: string) {
    const base = title
        .toLocaleLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");

    const suffix = randomBytes(3).toString("hex");

    return `${base}-${suffix}`;
}