# Eventful

A full-stack ticketing platform API built for AltSchool Africa's 3rd semester exam. Eventful lets creators publish events, eventees discover and buy tickets, and both sides interact through QR-code verification, Paystack payments, flexible reminders, and creator analytics.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Database:** PostgreSQL + Prisma ORM (v7, driver adapters)
- **Cache:** Redis (cache-aside pattern for lists, event details, analytics)
- **Job Queue:** BullMQ (delayed reminder notifications)
- **Auth:** JWT (access + refresh tokens), bcrypt
- **Payments:** Paystack (transaction initialize + webhook verification)
- **QR Codes:** `qrcode`
- **Validation:** Zod
- **Rate Limiting:** `express-rate-limit`, Redis-backed store
- **API Docs:** Swagger UI (OpenAPI 3.0, generated from JSDoc comments)
- **Testing:** Jest + Supertest

## Requirements Covered

| Requirement | Implementation |
|---|---|
| Authentication & Authorization | JWT-based auth, role-based access control (`CREATOR` / `EVENTEE`) |
| QR Code Generation | Generated automatically once ticket payment is confirmed |
| Shareability | Pre-built social share links (WhatsApp, Twitter, Facebook, Telegram, LinkedIn) per event |
| Notifications | BullMQ delayed jobs — creators set default reminder offsets, eventees can add their own |
| Analytics | Creator-wide overview + per-event stats (tickets sold, scanned, revenue), cached |
| Payment | Paystack transaction initialize + signature-verified webhook |

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- A free [Paystack](https://dashboard.paystack.com/signup) test account (for `PAYSTACK_SECRET_KEY`)

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd eventful
npm install
```

### 2. Set up PostgreSQL

Make sure PostgreSQL is running locally, then create the app database and role:

```bash
sudo -u postgres psql
```

```sql
CREATE USER eventful_user WITH PASSWORD 'your_password_here' CREATEDB;
CREATE DATABASE eventful OWNER eventful_user;
\q
```

> `CREATEDB` is required — Prisma's `migrate dev` creates a temporary shadow database to detect schema drift, which needs this privilege.

### 3. Set up Redis

```bash
sudo apt install redis-server
sudo systemctl start redis-server
```

### 4. Configure environment variables

Create your local environment file based on the project defaults already present in the repo:

```bash
cp .env .env.local
```

Then update the values for your local machine. Required variables include:

```
DATABASE_URL="postgresql://eventful_user:your_password_here@localhost:5432/eventful?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_ACCESS_SECRET="<any long random string>"
JWT_REFRESH_SECRET="<a different long random string>"
PAYSTACK_SECRET_KEY="sk_test_..."
```

### 5. Run database migrations

```bash
npx prisma generate
npx prisma migrate dev
```

If you want to apply the existing schema to a fresh database, `npx prisma migrate deploy` is also valid.

### 6. Start the server

```bash
npm run dev
```

Server runs at `http://localhost:4000`. Confirm it's alive:

```bash
curl http://localhost:4000/health
```

## API Documentation

Interactive Swagger UI is available at:

```
http://localhost:4000/api-docs
```

Every endpoint can be tested directly from this page — click **Authorize**, paste a JWT access token (obtained from `/api/v1/auth/login` or `/api/v1/auth/signup`), and use **Try it out** on any route.

## Testing Webhooks Locally

Paystack webhooks require a publicly reachable URL. For local development, make sure the app is running first:

```bash
npm run dev
```

Then expose it:

```bash
ngrok http 4000
```

Set the forwarded URL (`https://<subdomain>.ngrok-free.app/api/v1/payments/webhook`) as your webhook URL in the Paystack dashboard under **Settings → API Keys & Webhooks**.

## Running Tests

Tests run against a **separate** test database, isolated from your dev data.

### One-time test DB setup

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE eventful_test OWNER eventful_user;
\q
```

The repo already includes `.env.test`; update it so it points to your local test database, then apply migrations:

```bash
DATABASE_URL="postgresql://eventful_user:your_password_here@localhost:5432/eventful_test?schema=public" npx prisma migrate deploy
```

### Run the suite

```bash
npm test
```

Includes unit tests (slug generation, JWT signing/verification) and integration tests (auth flows, role-based authorization, event creation) run against the real Express app via Supertest.

## Project Structure

```
src/
├── app.ts                 # Express app bootstrap
├── config/                # env, Prisma client, Redis client
├── middleware/            # auth, rate limiting, validation, error handling
├── modules/
│   ├── auth/              # signup, login, refresh
│   ├── events/            # CRUD, listings, share links
│   ├── tickets/           # apply/buy, QR verification
│   ├── payments/          # Paystack integration
│   ├── reminders/         # reminder logic
│   └── analytics/         # creator stats
├── jobs/                  # BullMQ queue + worker logic
├── utils/                 # cache, JWT, slugify, QR generation
├── docs/                  # Swagger config
├── server.ts              # server bootstrap
└── generated/             # Prisma-generated client output
prisma/
├── schema.prisma          # data models
├── migrations/            # generated migration files
└── migration_lock.toml

tests/
├── unit/
└── integration/
```

## Key Design Decisions

- **Money stored as integers (kobo), never floats** — avoids floating-point rounding errors.
- **QR codes encode a random opaque token, not the ticket ID** — prevents ticket enumeration.
- **Cache-aside pattern via Redis** — event listings, event details, and analytics are cached with short TTLs and explicitly invalidated on writes.
- **Ownership checks live in the service layer**, not just role middleware — `requireRole("CREATOR")` confirms *what* a user is, but service functions confirm they own the *specific* resource being modified.
- **Webhook route bypasses the global JSON body parser** — Paystack's signature verification requires the raw request bytes, so `/api/v1/payments/webhook` is registered with `express.raw()` ahead of the global `express.json()` middleware.

## Author

Bamigbose Gideon — AltSchool Africa, Software Engineering

## Notes

- PostgreSQL and Redis must be running before local development or test execution.
- The repo includes `.env` and `.env.test`; use them as your local environment baseline rather than a missing `.env.example` file.
- The app expects the `eventful_user` database role and matching test database to exist on your local PostgreSQL instance.