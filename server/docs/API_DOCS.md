# API Documentation

Base URL: `/api/v1`
All endpoints except `auth/register` and `auth/login` require a header:
`Authorization: Bearer <jwt>`

All responses follow one of two shapes:

```json
{ "data": { ... } }
```
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

---

## Auth

### POST /auth/register
Creates a `customer` account. Staff/manager/admin accounts are provisioned separately (not yet exposed as a public endpoint — see Setup Guide for creating one via SQL/seed during development).

Request:
```json
{ "name": "Asha Rao", "email": "asha@example.com", "password": "StrongPass123" }
```
Response `201`:
```json
{ "data": { "id": "uuid", "name": "Asha Rao", "email": "asha@example.com" } }
```

### POST /auth/login
Request:
```json
{ "email": "asha@example.com", "password": "StrongPass123" }
```
Response `200`:
```json
{
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "id": "uuid", "name": "Asha Rao", "email": "asha@example.com", "role": "customer" }
  }
}
```

---

## Products

### GET /products
Any authenticated role. Lists active products.

### POST /products  *(admin only)*
```json
{ "name": "SmartPhone X1", "category": "Electronics", "teamId": "uuid" }
```

### PATCH /products/:id  *(admin only)*
```json
{ "isActive": false }
```

---

## Teams

### GET /teams  *(admin, manager)*

### POST /teams  *(admin only)*
```json
{ "name": "Hardware Support", "leadId": "uuid" }
```

---

## Tickets

### POST /tickets  *(customer only)*
Creates a ticket and immediately triggers auto-assignment to the team that handles the chosen product (and the least-loaded staff member in that team).

```json
{
  "title": "Phone won't charge",
  "description": "Device stopped charging after the last update.",
  "productId": "uuid",
  "priority": "high"
}
```
Response `201` — the created, auto-assigned ticket:
```json
{
  "data": {
    "id": "uuid",
    "ticket_number": "TCK-000231",
    "status": "open",
    "priority": "high",
    "assigned_team_id": "uuid",
    "assigned_staff_id": "uuid",
    "created_at": "2026-06-18T10:00:00.000Z"
  }
}
```

### GET /tickets/search
Role-scoped automatically: customers see only their own tickets, staff only tickets assigned to them, managers only their team's tickets, admins see everything — further narrowed by any filters supplied.

Query params (all optional): `status`, `priority`, `productId`, `assignedStaffId`, `assignedTeamId`, `q` (free text on title/ticket number), `dateFrom`, `dateTo`, `page`, `pageSize`.

```
GET /tickets/search?status=open&priority=high&page=1&pageSize=20
```
Response `200`:
```json
{ "data": { "items": [ /* tickets */ ], "total": 42, "page": 1, "pageSize": 20 } }
```

### GET /tickets/:id
Returns the ticket plus its full history log and comments (internal notes excluded for customers).

```json
{
  "data": {
    "ticket": { "...": "..." },
    "history": [
      { "action_type": "created", "new_value": "open", "actor_name": "Asha Rao", "created_at": "..." },
      { "action_type": "assignment", "new_value": "staff:uuid", "note": "Auto-assigned to least-loaded available staff member." }
    ],
    "comments": [ { "comment_text": "Looking into this now.", "is_internal": false, "author_name": "Staff Name" } ]
  }
}
```

### PATCH /tickets/:id/status  *(staff, manager, admin)*
Only valid lifecycle transitions are accepted: `open → in_progress → resolved → closed`, with `resolved → reopened → in_progress` also allowed. Anything else returns `400 INVALID_TRANSITION`. Re-sending the current status is a no-op (idempotent).

```json
{ "status": "in_progress", "note": "Started investigating." }
```

### PATCH /tickets/:id/assign  *(manager, admin)*
```json
{ "staffId": "uuid", "note": "Reassigning - original agent is on leave." }
```

### POST /tickets/:id/comments
```json
{ "commentText": "Replacement unit has shipped.", "isInternal": false }
```
Customers can never set `isInternal: true` — the server forces it to `false` for that role regardless of what's sent.

---

## Dashboard

### GET /dashboard/staff/:id  *(staff — own id only; manager, admin — any)*
```json
{
  "data": {
    "summary": {
      "total_assigned": "14",
      "completed": "10",
      "pending": "4",
      "avg_resolution_time": "1 day 03:12:00"
    },
    "ticketTimings": [
      { "ticket_number": "TCK-000201", "status": "resolved", "resolution_time": "08:45:00" }
    ]
  }
}
```

### GET /dashboard/team/:id  *(manager, admin)*
```json
{
  "data": {
    "summary": { "total_tickets": "120", "completed": "95", "backlog": "25", "avg_resolution_time": "1 day 02:00:00" },
    "staffBreakdown": [
      { "staff_name": "Staff One", "total_assigned": "40", "completed": "35", "pending": "5", "avg_resolution_time": "0 days 22:00:00" }
    ]
  }
}
```

### GET /dashboard/products  *(manager, admin)*
```json
{
  "data": [
    { "product_name": "SmartPhone X1", "total_complaints": "58", "open_complaints": "9", "avg_resolution_time": "1 day 04:00:00" }
  ]
}
```

---

## Error Codes

| Code | Status | Meaning |
| --- | --- | --- |
| `VALIDATION_ERROR` | 400 | Request body/query failed schema validation |
| `INVALID_TRANSITION` | 400 | Requested status change isn't a valid lifecycle move |
| `UNAUTHORIZED` | 401 | Missing/invalid/expired token, or bad credentials |
| `FORBIDDEN` | 403 | Authenticated, but not permitted to perform this action |
| `NOT_FOUND` | 404 | Resource (or route) does not exist |
| `CONFLICT` | 409 | e.g. registering an email that's already in use |
| `INTERNAL_ERROR` | 500 | Unexpected server error (details logged server-side only) |
