import { describe, expect, it, afterAll, beforeAll } from "@jest/globals";

import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/config/prisma";

describe("Events endpoints", () => {
  const uniqueSuffix = Date.now();
  const creatorEmail = `integration-events-creator-${uniqueSuffix}@test.com`;
  const eventeeEmail = `integration-events-eventee-${uniqueSuffix}@test.com`;

  let creatorToken: string;
  let eventeeToken: string;

  beforeAll(async () => {
    const creatorSignup = await request(app).post("/api/v1/auth/signup").send({
      name: "Events Test Creator",
      email: creatorEmail,
      password: "password123",
      role: "CREATOR",
    });
    creatorToken = creatorSignup.body.data.accessToken;

    const eventeeSignup = await request(app).post("/api/v1/auth/signup").send({
      name: "Events Test Eventee",
      email: eventeeEmail,
      password: "password123",
      role: "EVENTEE",
    });
    eventeeToken = eventeeSignup.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("allows a CREATOR to create an event", async () => {
    const res = await request(app)
      .post("/api/v1/events")
      .set("Authorization", `Bearer ${creatorToken}`)
      // .set() adds a request header — this is how we simulate an
      // authenticated request in tests, same as pasting a token into
      // Thunder Client's Auth tab

      .send({
        title: "Integration Test Concert",
        description: "A concert created purely for automated testing purposes.",
        venue: "Test Venue",
        price: 100000,
        startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),

      });

    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBeDefined();
    expect(res.body.data.creatorId).toBeDefined();
  });

  it("rejects event creation from an EVENTEE (wrong role)", async () => {
    const res = await request(app)
      .post("/api/v1/events")
      .set("Authorization", `Bearer ${eventeeToken}`)
      .send({
        title: "Should Not Be Created",
        description: "This should be rejected by requireRole.",
        venue: "Test Venue",
        price: 100000,
        startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endsAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      });

    expect(res.status).toBe(403);
    // directly tests that requireRole("CREATOR") actually blocks eventees
  });

  it("rejects event creation with no auth token at all", async () => {
    const res = await request(app).post("/api/v1/events").send({
      title: "Should Not Be Created",
      description: "No auth token provided.",
      venue: "Test Venue",
      price: 100000,
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    });

    expect(res.status).toBe(401);
    // tests requireAuth specifically, separate from requireRole above
  });

  it("lists upcoming events publicly, without needing auth", async () => {
    const res = await request(app).get("/api/v1/events");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.events)).toBe(true);
    // no .set("Authorization", ...) at all here — confirms this route
    // is genuinely public, matching the "eventees should see all events" requirement
  });
});