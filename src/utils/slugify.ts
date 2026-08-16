import { randomBytes } from "node:crypto";

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