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
├── server/    # Node.js / Express / PostgreSQL backend API
│   ├── README.md
│   └── docs/
│       ├── API_DOCS.md
│       └── SETUP_GUIDE.md
└── client/    # React 18 + Vite frontend
    └── README.md
```

## Status

| Phase | Scope                                                        | Status      |
| ----- | ------------------------------------------------------------ | ----------- |
| 1     | DB schema, auth, users/roles/teams/products                  | ✅ Complete |
| 2     | Ticket creation, auto-assignment, status transitions         | ✅ Complete |
| 3     | Ticket history, comments, search/filters                     | ✅ Complete |
| 4     | Frontend: auth, ticket list/detail, role-based views         | ✅ Complete |
| 5     | Performance dashboard UI (Recharts)                          | ✅ Complete |
| 6     | Integration tests (16 unit + 28 integration), docs finalized | ✅ Complete |

## Quick Start

**Backend:**

```bash
cd server
npm install
cp .env.example .env        # configure DATABASE_URL and JWT_SECRET
npm run migrate             # create tables, indexes, and seed roles
npm run seed                # seed teams, products, and admin account
npm run dev                 # API live at http://localhost:5000/api/v1
```

**Frontend** (in a new terminal):

```bash
cd client
npm install
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:5000/api/v1
npm run dev                 # App live at http://localhost:3000
```

Then open http://localhost:3000 . Register a new customer account, or contact your administrator for staff/admin credentials.

## Testing

```bash
cd server
npm run test:unit           # 12 unit tests — no database required
npm run test:integration    # 28 integration tests — requires a running PostgreSQL DB
npm test                    # both suites
```

See `server/docs/SETUP_GUIDE.md` for how to set up a dedicated test database.

## Documentation

- **Architecture & design:** [`docs/Complaint_Management_System_Design.md`](docs/Complaint_Management_System_Design.md)
- **API reference:** [`server/docs/API_DOCS.md`](server/docs/API_DOCS.md)
- **Backend setup:** [`server/docs/SETUP_GUIDE.md`](server/docs/SETUP_GUIDE.md)
- **Frontend guide:** [`client/README.md`](client/README.md)
