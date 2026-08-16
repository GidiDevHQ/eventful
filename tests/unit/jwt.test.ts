import { describe, expect, it } from "@jest/globals";
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../src/utils/jwt";

describe("jwt utils", () => {
  const payload = { sub: "user-123", role: "CREATOR" as const };

  it("signs and verifies an access token correctly", () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);

    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.role).toBe(payload.role);
  });

  it("signs and verifies a refresh token correctly", () => {
    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);

    expect(decoded.sub).toBe(payload.sub);
  });

  it("throws when verifying a garbage/invalid token", () => {
    expect(() => verifyAccessToken("not.a.real.token")).toThrow();
  });

  it("access token and refresh token are NOT interchangeable", () => {
    const accessToken = signAccessToken(payload);
    expect(() => verifyRefreshToken(accessToken)).toThrow();
  });
});
