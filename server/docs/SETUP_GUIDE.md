# Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or a connection string to a hosted instance)

## 1. Create the database

```bash
psql -U postgres -c "CREATE DATABASE cms_db;"
psql -U postgres -c "CREATE USER cms_user WITH PASSWORD 'cms_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE cms_db TO cms_user;"
```

(Skip this step if you're pointing at an already-provisioned database — just have its connection string ready.)

## 2. Install dependencies

```bash
cd server
npm install
```

## 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_SECRET` — a long random string (e.g. `openssl rand -hex 32`)
- `CLIENT_ORIGIN` — the frontend's URL, for CORS (defaults to `http://localhost:3000`)

## 4. Run migrations

```bash
npm run migrate
```

This creates all tables, indexes, and constraints, and seeds the four fixed roles (`admin`, `manager`, `staff`, `customer`). Safe to re-run — already-applied migrations are skipped.

## 5. Seed sample data (optional, recommended for local dev)

```bash
npm run seed
```

Creates three sample teams, four sample products mapped to those teams, and one admin account (`admin@glimmora.test` / `Admin@123`).

To create your first **staff** or **manager** account, log in as the seeded admin and call the admin user-management endpoint:

```bash
curl -X POST http://localhost:5000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"name":"Staff One","email":"staff1@glimmora.test","password":"Password123","role":"staff","teamId":"TEAM_UUID"}'
```

Get a `TEAM_UUID` from `GET /teams` (admin/manager only). See `docs/API_DOCS.md` for the full `POST /users` reference.

## 6. Run the server

```bash
npm run dev      # with auto-restart (nodemon)
# or
npm start
```

The API is now live at `http://localhost:5000/api/v1`. Check `GET /api/v1/health` for a quick liveness check.

## 7. Run tests

```bash
npm test
```

## 8. Try it end to end

```bash
# Register a customer
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Customer","email":"customer@test.com","password":"Password123"}'

# Log in
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"Password123"}'
# copy the returned token

# Create a ticket (replace TOKEN and a real productId from GET /products)
curl -X POST http://localhost:5000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Phone wont charge","description":"Stopped charging after update.","productId":"PRODUCT_UUID","priority":"high"}'
```

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| `Missing required environment variable` on startup | `.env` not created/filled in — see step 3 |
| `ECONNREFUSED` connecting to Postgres | Database isn't running, or `DATABASE_URL` host/port is wrong |
| `relation "users" does not exist` | Migrations haven't run — `npm run migrate` |
| `401 Unauthorized` on every request | Missing `Authorization: Bearer <token>` header, or token expired (re-login) |
