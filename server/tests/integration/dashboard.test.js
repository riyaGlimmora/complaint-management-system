// tests/integration/dashboard.test.js
// Verifies that the performance dashboard endpoints return correct aggregations
// after real tickets have been created and resolved through the actual lifecycle.

const request = require('supertest');
const app     = require('../../src/app');
const { setupTestDb, teardownTestDb, clearDb, seedBaseData } = require('./helpers/testDb');
const { loginAs } = require('./helpers/authHelper');

let ids;
let customerToken, staffToken, adminToken;

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

async function createAndResolveTicket() {
  const created = await request(app)
    .post('/api/v1/tickets')
    .set('Authorization', customerToken)
    .send({
      title: 'Perf test ticket',
      description: 'Created for dashboard metric verification.',
      productId: ids.productId,
      priority: 'medium',
    });
  const id = created.body.data.id;

  const patch = (status) =>
    request(app)
      .patch(`/api/v1/tickets/${id}/status`)
      .set('Authorization', staffToken)
      .send({ status });

  await patch('in_progress');
  await patch('resolved');
  return id;
}

// ─── staff dashboard ─────────────────────────────────────────────────────────

describe('GET /api/v1/dashboard/staff/:id', () => {
  test('returns correct counts after a ticket is resolved', async () => {
    await createAndResolveTicket();

    const res = await request(app)
      .get(`/api/v1/dashboard/staff/${ids.staffId}`)
      .set('Authorization', staffToken);

    expect(res.status).toBe(200);
    const { summary } = res.body.data;
    expect(parseInt(summary.total_assigned)).toBe(1);
    expect(parseInt(summary.completed)).toBe(1);
    expect(parseInt(summary.pending)).toBe(0);
  });

  test('includes per-ticket timings after resolution', async () => {
    await createAndResolveTicket();

    const res = await request(app)
      .get(`/api/v1/dashboard/staff/${ids.staffId}`)
      .set('Authorization', adminToken);

    expect(res.status).toBe(200);
    const { ticketTimings } = res.body.data;
    expect(ticketTimings).toHaveLength(1);
    expect(ticketTimings[0].status).toBe('resolved');
  });

  test('pending count reflects open tickets', async () => {
    // Create ticket but do NOT resolve it
    await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', customerToken)
      .send({
        title: 'Open ticket',
        description: 'This one stays open.',
        productId: ids.productId,
        priority: 'low',
      });

    const res = await request(app)
      .get(`/api/v1/dashboard/staff/${ids.staffId}`)
      .set('Authorization', staffToken);

    expect(res.status).toBe(200);
    expect(parseInt(res.body.data.summary.pending)).toBe(1);
    expect(parseInt(res.body.data.summary.completed)).toBe(0);
  });

  test('403 — staff cannot view another staff member\'s dashboard', async () => {
    // Use a fake but valid-looking UUID for the other staff member
    const fakeId = '11111111-1111-1111-1111-111111111111';
    const res = await request(app)
      .get(`/api/v1/dashboard/staff/${fakeId}`)
      .set('Authorization', staffToken);
    expect(res.status).toBe(403);
  });

  test('200 — admin can view any staff member\'s dashboard', async () => {
    const res = await request(app)
      .get(`/api/v1/dashboard/staff/${ids.staffId}`)
      .set('Authorization', adminToken);
    expect(res.status).toBe(200);
  });
});

// ─── team dashboard ───────────────────────────────────────────────────────────

describe('GET /api/v1/dashboard/team/:id', () => {
  test('returns team summary with staff breakdown', async () => {
    await createAndResolveTicket();

    const res = await request(app)
      .get(`/api/v1/dashboard/team/${ids.teamId}`)
      .set('Authorization', adminToken);

    expect(res.status).toBe(200);
    const { summary, staffBreakdown } = res.body.data;
    expect(parseInt(summary.total_tickets)).toBe(1);
    expect(parseInt(summary.completed)).toBe(1);
    expect(parseInt(summary.backlog)).toBe(0);
    expect(staffBreakdown).toHaveLength(1);
    expect(staffBreakdown[0].staff_id).toBe(ids.staffId);
  });

  test('403 — customer cannot access team dashboard', async () => {
    const res = await request(app)
      .get(`/api/v1/dashboard/team/${ids.teamId}`)
      .set('Authorization', customerToken);
    expect(res.status).toBe(403);
  });

  test('403 — staff cannot access team dashboard', async () => {
    const res = await request(app)
      .get(`/api/v1/dashboard/team/${ids.teamId}`)
      .set('Authorization', staffToken);
    expect(res.status).toBe(403);
  });
});

// ─── product dashboard ────────────────────────────────────────────────────────

describe('GET /api/v1/dashboard/products', () => {
  test('returns a row per product with correct complaint count', async () => {
    await createAndResolveTicket();
    await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', customerToken)
      .send({
        title: 'Second complaint',
        description: 'Another issue on the same product.',
        productId: ids.productId,
        priority: 'high',
      });

    const res = await request(app)
      .get('/api/v1/dashboard/products')
      .set('Authorization', adminToken);

    expect(res.status).toBe(200);
    const productRow = res.body.data.find((p) => p.product_id === ids.productId);
    expect(productRow).toBeDefined();
    expect(parseInt(productRow.total_complaints)).toBe(2);
    // one resolved, one still open
    expect(parseInt(productRow.open_complaints)).toBe(1);
  });

  test('403 — customer cannot access product dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/products')
      .set('Authorization', customerToken);
    expect(res.status).toBe(403);
  });
});
