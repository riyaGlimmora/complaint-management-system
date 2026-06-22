// tests/integration/tickets.test.js
// Tests the full ticket lifecycle end-to-end against a real DB:
// creation + auto-assignment, status transitions (valid and invalid),
// role-scoped search, comments (including internal note visibility), and
// the idempotent status patch.

const request = require('supertest');
const app     = require('../../src/app');
const { setupTestDb, teardownTestDb, clearDb, seedBaseData } = require('./helpers/testDb');
const { loginAs } = require('./helpers/authHelper');

let ids;          // { teamId, productId, adminId, staffId, customerId }
let customerToken;
let staffToken;
let adminToken;

beforeAll(setupTestDb);
afterAll(teardownTestDb);

beforeEach(async () => {
  await clearDb();
  ids = await seedBaseData();
  [customerToken, staffToken, adminToken] = await Promise.all([
    loginAs('customer@test.local', 'Cust@1234'),
    loginAs('staff@test.local',    'Staff@123'),
    loginAs('admin@test.local',    'Admin@123'),
  ]);
});

// ─── helpers ────────────────────────────────────────────────────────────────

function createTicket(token, overrides = {}) {
  return request(app)
    .post('/api/v1/tickets')
    .set('Authorization', token)
    .send({
      title:       'Test complaint',
      description: 'Something went wrong with my order.',
      productId:   ids.productId,
      priority:    'medium',
      ...overrides,
    });
}

// ─── creation ───────────────────────────────────────────────────────────────

describe('POST /api/v1/tickets', () => {
  test('201 — customer creates ticket, gets auto-assigned to team', async () => {
    const res = await createTicket(customerToken);
    expect(res.status).toBe(201);
    const t = res.body.data;
    expect(t.ticket_number).toMatch(/^TCK-\d{6}$/);
    expect(t.status).toBe('open');
    // auto-assignment should have set the team
    expect(t.assigned_team_id).toBe(ids.teamId);
    // and the only staff member in that team
    expect(t.assigned_staff_id).toBe(ids.staffId);
  });

  test('400 — missing description returns VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', customerToken)
      .send({ title: 'No desc', productId: ids.productId });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('400 — non-existent productId is rejected', async () => {
    const res = await createTicket(customerToken, {
      productId: '00000000-0000-0000-0000-000000000000',
    });
    expect(res.status).toBe(400);
  });

  test('403 — staff cannot create tickets (only customers can)', async () => {
    const res = await createTicket(staffToken);
    expect(res.status).toBe(403);
  });

  test('403 — admin cannot create tickets (only customers can)', async () => {
    const res = await createTicket(adminToken);
    expect(res.status).toBe(403);
  });

  test('ticket numbers are sequential and unique across concurrent creates', async () => {
    const results = await Promise.all([
      createTicket(customerToken),
      createTicket(customerToken),
      createTicket(customerToken),
    ]);
    const numbers = results.map((r) => r.body.data?.ticket_number).filter(Boolean);
    const unique = new Set(numbers);
    expect(unique.size).toBe(numbers.length);
  });
});

// ─── detail ─────────────────────────────────────────────────────────────────

describe('GET /api/v1/tickets/:id', () => {
  let ticketId;

  beforeEach(async () => {
    const res = await createTicket(customerToken);
    ticketId = res.body.data.id;
  });

  test('200 — customer sees their own ticket with history and comments', async () => {
    const res = await request(app)
      .get(`/api/v1/tickets/${ticketId}`)
      .set('Authorization', customerToken);
    expect(res.status).toBe(200);
    expect(res.body.data.ticket.id).toBe(ticketId);
    expect(Array.isArray(res.body.data.history)).toBe(true);
    expect(res.body.data.history.length).toBeGreaterThan(0);
  });

  test('200 — admin can see any ticket', async () => {
    const res = await request(app)
      .get(`/api/v1/tickets/${ticketId}`)
      .set('Authorization', adminToken);
    expect(res.status).toBe(200);
  });

  test('404 — non-existent ticket id returns NOT_FOUND', async () => {
    const res = await request(app)
      .get('/api/v1/tickets/00000000-0000-0000-0000-000000000000')
      .set('Authorization', adminToken);
    expect(res.status).toBe(404);
  });
});

// ─── status transitions ──────────────────────────────────────────────────────

describe('PATCH /api/v1/tickets/:id/status', () => {
  let ticketId;

  beforeEach(async () => {
    const res = await createTicket(customerToken);
    ticketId = res.body.data.id;
  });

  test('200 — staff can move open → in_progress', async () => {
    const res = await request(app)
      .patch(`/api/v1/tickets/${ticketId}/status`)
      .set('Authorization', staffToken)
      .send({ status: 'in_progress', note: 'Starting investigation' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('in_progress');
  });

  test('400 — INVALID_TRANSITION: open → resolved is not allowed', async () => {
    const res = await request(app)
      .patch(`/api/v1/tickets/${ticketId}/status`)
      .set('Authorization', staffToken)
      .send({ status: 'resolved' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TRANSITION');
  });

  test('idempotent — re-sending the same status is a no-op (200, no duplicate history)', async () => {
    // Move to in_progress
    await request(app)
      .patch(`/api/v1/tickets/${ticketId}/status`)
      .set('Authorization', staffToken)
      .send({ status: 'in_progress' });

    // Send in_progress again — should succeed without adding a duplicate history entry
    const res = await request(app)
      .patch(`/api/v1/tickets/${ticketId}/status`)
      .set('Authorization', staffToken)
      .send({ status: 'in_progress' });
    expect(res.status).toBe(200);

    const detail = await request(app)
      .get(`/api/v1/tickets/${ticketId}`)
      .set('Authorization', staffToken);
    const statusChanges = detail.body.data.history.filter(
      (h) => h.action_type === 'status_change'
    );
    // Only one status_change entry, not two
    expect(statusChanges).toHaveLength(1);
  });

  test('full lifecycle: open → in_progress → resolved → closed', async () => {
    const patch = (status) =>
      request(app)
        .patch(`/api/v1/tickets/${ticketId}/status`)
        .set('Authorization', staffToken)
        .send({ status });

    expect((await patch('in_progress')).status).toBe(200);
    expect((await patch('resolved')).status).toBe(200);
    expect((await patch('closed')).status).toBe(200);

    const detail = await request(app)
      .get(`/api/v1/tickets/${ticketId}`)
      .set('Authorization', adminToken);
    expect(detail.body.data.ticket.status).toBe('closed');
    expect(detail.body.data.ticket.resolved_at).not.toBeNull();
    expect(detail.body.data.ticket.closed_at).not.toBeNull();
  });

  test('reopen path: resolved → reopened → in_progress', async () => {
    const patch = (status) =>
      request(app)
        .patch(`/api/v1/tickets/${ticketId}/status`)
        .set('Authorization', staffToken)
        .send({ status });

    await patch('in_progress');
    await patch('resolved');
    expect((await patch('reopened')).status).toBe(200);
    expect((await patch('in_progress')).status).toBe(200);
  });

  test('403 — customer cannot change ticket status', async () => {
    const res = await request(app)
      .patch(`/api/v1/tickets/${ticketId}/status`)
      .set('Authorization', customerToken)
      .send({ status: 'in_progress' });
    expect(res.status).toBe(403);
  });
});

// ─── comments ────────────────────────────────────────────────────────────────

describe('POST /api/v1/tickets/:id/comments', () => {
  let ticketId;

  beforeEach(async () => {
    const res = await createTicket(customerToken);
    ticketId = res.body.data.id;
  });

  test('201 — customer can post a public comment', async () => {
    const res = await request(app)
      .post(`/api/v1/tickets/${ticketId}/comments`)
      .set('Authorization', customerToken)
      .send({ commentText: 'Still happening after reboot.' });
    expect(res.status).toBe(201);
    expect(res.body.data.is_internal).toBe(false);
  });

  test('internal note posted by staff is hidden from customer', async () => {
    await request(app)
      .post(`/api/v1/tickets/${ticketId}/comments`)
      .set('Authorization', staffToken)
      .send({ commentText: 'Escalating internally.', isInternal: true });

    // Customer fetches the ticket — they must not see the internal note
    const detail = await request(app)
      .get(`/api/v1/tickets/${ticketId}`)
      .set('Authorization', customerToken);
    const internal = detail.body.data.comments.filter((c) => c.is_internal);
    expect(internal).toHaveLength(0);

    // Staff fetching the same ticket CAN see it
    const staffDetail = await request(app)
      .get(`/api/v1/tickets/${ticketId}`)
      .set('Authorization', staffToken);
    const staffInternal = staffDetail.body.data.comments.filter((c) => c.is_internal);
    expect(staffInternal).toHaveLength(1);
  });

  test('isInternal is forced to false when set by a customer', async () => {
    // Even if a customer sends isInternal: true, the server must ignore it
    const res = await request(app)
      .post(`/api/v1/tickets/${ticketId}/comments`)
      .set('Authorization', customerToken)
      .send({ commentText: 'Trying to post an internal note.', isInternal: true });
    expect(res.status).toBe(201);
    expect(res.body.data.is_internal).toBe(false);
  });
});

// ─── search / filters ────────────────────────────────────────────────────────

describe('GET /api/v1/tickets/search', () => {
  beforeEach(async () => {
    // Create two tickets then move one to in_progress for filter testing
    const r1 = await createTicket(customerToken, { title: 'Battery drains fast', priority: 'high' });
    const r2 = await createTicket(customerToken, { title: 'Screen flickering', priority: 'low' });
    await request(app)
      .patch(`/api/v1/tickets/${r1.body.data.id}/status`)
      .set('Authorization', staffToken)
      .send({ status: 'in_progress' });
  });

  test('returns paginated results for the requesting role', async () => {
    const res = await request(app)
      .get('/api/v1/tickets/search')
      .set('Authorization', customerToken)
      .query({ page: 1, pageSize: 10 });
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(2);
    expect(res.body.data.items).toHaveLength(2);
  });

  test('status filter returns only matching tickets', async () => {
    const res = await request(app)
      .get('/api/v1/tickets/search')
      .set('Authorization', adminToken)
      .query({ status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.items[0].status).toBe('in_progress');
  });

  test('free-text search on title works', async () => {
    const res = await request(app)
      .get('/api/v1/tickets/search')
      .set('Authorization', adminToken)
      .query({ q: 'battery' });
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.items[0].title).toMatch(/battery/i);
  });

  test('priority filter works', async () => {
    const res = await request(app)
      .get('/api/v1/tickets/search')
      .set('Authorization', adminToken)
      .query({ priority: 'high' });
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(1);
  });

  test('role scoping: staff only sees their own assigned tickets', async () => {
    // Staff is assigned to both tickets via auto-assignment (only one staff in team).
    const res = await request(app)
      .get('/api/v1/tickets/search')
      .set('Authorization', staffToken);
    expect(res.status).toBe(200);
    // All tickets in the results must be assigned to this staff member
    res.body.data.items.forEach((t) => {
      expect(t.assigned_staff_id).toBe(ids.staffId);
    });
  });
});
