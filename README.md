# Complaint Management System

Task 3 — Glimmora International Full-Stack Trainee Programme.

A system for raising complaints/tickets against products, automatic routing to
the team responsible for that product, full ticket lifecycle tracking, and a
performance dashboard across staff, teams, and products.

## Repository Layout

```
cms/
├── docs/
│   └── Complaint_Management_System_Design.md   # full architecture, ER diagram, lifecycle design
├── server/    # Node.js / Express / PostgreSQL backend API (complete)
│   ├── README.md
│   └── docs/
│       ├── API_DOCS.md
│       └── SETUP_GUIDE.md
└── client/    # React frontend (next phase)
```

## Status

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | DB schema, auth, users/roles/teams/products | ✅ Done |
| 2 | Ticket creation, auto-assignment, status transitions | ✅ Done |
| 3 | Ticket history, comments, search/filters | ✅ Done |
| 4 | Frontend: auth, ticket views, role-based UI | ⏳ Next |
| 5 | Performance dashboard UI | ⏳ Next |
| 6 | Integration tests, polish, final docs | ⏳ Next |

## Getting Started

See [`server/docs/SETUP_GUIDE.md`](server/docs/SETUP_GUIDE.md) to get the API running locally, and [`server/docs/API_DOCS.md`](server/docs/API_DOCS.md) for the full endpoint reference.

## Design Reference

[`docs/Complaint_Management_System_Design.md`](docs/Complaint_Management_System_Design.md) — system architecture, ER diagram, ticket lifecycle state machine, auto-assignment logic, and the full database schema.
