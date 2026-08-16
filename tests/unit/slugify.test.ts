import { describe, expect, it } from "@jest/globals";
import { slugify } from "../../src/utils/slugify";

describe("slugify", () => {
  it("converts a title to lowercase, hyphenated slug", () => {
    const result = slugify("Lagos Jazz Night");
    expect(result).toMatch(/^lagos-jazz-night-[a-f0-9]{6}$/);
  });
  it("strips special characters", () => {
    const result = slugify("Jazz Night! 🎷 #1");
    expect(result).toMatch(/^jazz-night-1-[a-f0-9]{6}$/);
  });
  it("collapses multiple spaces into a single hyphen", () => {
    const result = slugify("Too    Many     Spaces");
    expect(result).toMatch(/^too-many-spaces-[a-f0-9]{6}$/);
  });
  it("produces a different suffix on each call, even for the same title", () => {
    const first = slugify("Same Title");
    const second = slugify("Same Title");
    expect(first).not.toBe(second);
  });
});
