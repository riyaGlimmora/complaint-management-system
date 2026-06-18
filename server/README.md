# Complaint Management System — Backend API

REST API for the Complaint Management System: ticket/complaint creation, automatic
routing to the product-handling team, full lifecycle tracking, and a performance
dashboard. Built with Node.js, Express, and PostgreSQL.

See [`../docs/Complaint_Management_System_Design.md`](../docs/Complaint_Management_System_Design.md)
(or the project root) for the full architecture, ER diagram, and lifecycle design.

## Tech Stack

- Node.js + Express
- PostgreSQL (`pg` driver, raw parameterized SQL — no ORM, by design, so every
  query is visible and easy to reason about)
- JWT authentication, bcrypt password hashing
- Joi request validation
- Jest for unit tests

## Project Structure

```
src/
├── config/        # env loading, db connection pool
├── middleware/     # auth, validation, error handling
├── routes/         # URL + method definitions per resource
├── controllers/     # request/response shaping
├── services/         # business logic (auto-assignment, lifecycle rules, dashboards)
├── models/            # parameterized SQL queries — the only layer touching the DB
├── validations/        # Joi schemas
└── app.js / server.js
migrations/    # versioned schema (001_init_schema.sql) + runner + seed script
tests/unit/    # service-layer tests with the DB mocked out
```

## Quick Start

See [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md) for full setup instructions.

```bash
npm install
cp .env.example .env   # then edit DATABASE_URL and JWT_SECRET
npm run migrate
npm run seed
npm run dev
```

The API is then available at `http://localhost:5000/api/v1`.

## Default Seeded Account

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@glimmora.test | Admin@123 |

Change this password immediately in any non-local environment.

## API Documentation

See [`docs/API_DOCS.md`](docs/API_DOCS.md) for every endpoint, request/response
shapes, and example payloads.

## Running Tests

```bash
npm test
```

Unit tests mock the data-access layer, so they run without a live database and
verify the business rules in isolation: the ticket lifecycle state machine and
the auto-assignment (least-loaded-staff) logic.

## Roles

| Role | Can do |
| --- | --- |
| `customer` | Create tickets, view/comment on own tickets |
| `staff` | View/update tickets assigned to them, change status, comment |
| `manager` | Everything staff can, plus reassign tickets within their team, view team dashboard |
| `admin` | Full access: manage products/teams/users, view all dashboards, reassign any ticket |
