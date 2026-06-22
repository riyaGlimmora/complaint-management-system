# Complaint Management System — Frontend

React single-page application for the CMS. Communicates with the Express backend
API over REST with JWT authentication. Role-based rendering within shared
components means a customer, staff member, manager, and admin all use the same
pages and components — what they see is gated by their role, not by separate page trees.

## Tech Stack

- React 18, Vite (fast dev server and build, per-route code splitting)
- React Router v6 (declarative routing with `ProtectedRoute` wrappers)
- Axios (shared instance with auto-attach-token and auto-logout-on-401 interceptors)
- Recharts (dashboard bar charts)
- Plain CSS custom properties (design tokens, no component library dependency)

## Project Structure

```
src/
├── context/         AuthContext — JWT + user persisted to localStorage
├── services/        Thin API modules (authApi, ticketApi, productApi, teamApi, userApi, dashboardApi)
│                    all importing from a single Axios instance in services/api.js
├── hooks/           useFetch (base), useTickets, useTicketDetail, useProducts,
│                    useTeams, useTeamStaff, useStaffDashboard, useTeamDashboard, useProductDashboard
├── utils/           roleHelpers.js — role predicates, transition rules, formatters
├── components/
│   ├── layout/      Navbar (role-conditional links), ProtectedRoute
│   ├── common/      LoadingSpinner, ErrorAlert, Pagination
│   ├── tickets/     TicketTable, TicketFilters, StatusBadge, PriorityBadge,
│   │                TicketHistoryTimeline, CommentList, CommentForm,
│   │                StatusChangeForm, AssignForm
│   └── dashboard/   StatCard, StaffBreakdownTable
└── pages/           LoginPage, RegisterPage, TicketListPage, CreateTicketPage,
                     TicketDetailPage, StaffDashboardPage, TeamDashboardPage,
                     ProductAnalysisPage, ProductsPage, TeamsPage, UsersPage
```

## Quick Start

```bash
cd client
npm install
cp .env.example .env     # set VITE_API_BASE_URL if your backend isn't on port 5000
npm run dev              # starts on http://localhost:3000
```

The backend must be running first. See `../server/docs/SETUP_GUIDE.md`.

## Pages by Role

| Page | Path | Roles |
| --- | --- | --- |
| Login / Register | `/login`, `/register` | Public |
| Ticket list + search | `/tickets` | All (content scoped by role) |
| Create complaint | `/tickets/new` | Customer only |
| Ticket detail | `/tickets/:id` | All (actions shown by role) |
| My performance | `/dashboard/staff/:id` | Staff (own), Manager, Admin |
| Team dashboard | `/dashboard/team/:id` | Manager, Admin |
| Product analysis | `/dashboard/products` | Manager, Admin |
| Products admin | `/products` | Admin |
| Teams admin | `/teams` | Admin |
| Users admin | `/users` | Admin |

## Key Design Decisions

**API calls only in services/hooks, never in components.** Every page and component
calls a custom hook (`useTickets`, `useTicketDetail`, etc.) and renders the result.
No component imports Axios or calls `fetch` directly. This keeps components pure
presentation logic and makes the data layer independently testable.

**One component per feature, not one per role.** `TicketTable` serves all four
roles. Columns and action buttons are conditionally rendered based on `useAuth().role`,
not via separate duplicated components. Same pattern in `TicketDetailPage`, `CommentForm`,
`StatusChangeForm`.

**Lazy loading per route.** Every page is a `React.lazy` import, so Vite emits a
separate JS chunk per route. Users download only the code for the pages they visit.
`Suspense` with a `LoadingSpinner` fallback wraps the route tree.

## Production Build

```bash
npm run build     # outputs to dist/
npm run preview   # locally preview the built app
```
