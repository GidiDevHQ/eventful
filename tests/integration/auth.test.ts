import { describe, expect, it, afterAll } from "@jest/globals";
import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/config/prisma";

describe("Auth endpoints", () => {
  const uniqueSuffix = Date.now();
  const testUser = {
    name: "Test Creator",
    email: `integration-creator-${uniqueSuffix}@test.com`,
    password: "password123",
    role: "CREATOR",
  };

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it("registers a new user and returns tokens", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send(testUser);
      // supertest builds a REAL HTTP request against your Express app —
      // no actual network socket opens, but it goes through your full
      // middleware chain exactly like a real request would

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.password).toBeUndefined();
    // confirms the password hash never leaks into the API response —
    // directly testing the `select` clause we wrote in auth.service.ts
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it("rejects signup with a duplicate email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send(testUser);
      // same email as the test above — this test relies on running AFTER it

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("rejects signup with an invalid email format", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ ...testUser, email: "not-a-real-email" });

    expect(res.status).toBe(400);
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("rejects login with wrong password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: "wrongpassword" });

    expect(res.status).toBe(401);
  });
});