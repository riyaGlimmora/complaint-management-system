// tests/integration/users.test.js
// Verifies the admin user-management endpoints and the team staff roster
// used by the assign-ticket dropdown in the frontend.

const request = require('supertest');
const app     = require('../../src/app');
const { setupTestDb, teardownTestDb, clearDb, seedBaseData } = require('./helpers/testDb');
const { loginAs } = require('./helpers/authHelper');

let ids;
let adminToken, customerToken, staffToken;

beforeAll(setupTestDb);
afterAll(teardownTestDb);

beforeEach(async () => {
  await clearDb();
  ids = await seedBaseData();
  [adminToken, customerToken, staffToken] = await Promise.all([
    loginAs('admin@test.local',    'Admin@123'),
    loginAs('customer@test.local', 'Cust@1234'),
    loginAs('staff@test.local',    'Staff@123'),
  ]);
});

// ─── POST /users ──────────────────────────────────────────────────────────────

describe('POST /api/v1/users', () => {
  test('201 — admin creates a staff account in a valid team', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', adminToken)
      .send({
        name:     'New Staff',
        email:    'newstaff@test.local',
        password: 'Password123',
        role:     'staff',
        teamId:   ids.teamId,
      });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ role: 'staff', teamId: ids.teamId });
    expect(res.body.data).not.toHaveProperty('password');
    expect(res.body.data).not.toHaveProperty('password_hash');
  });

  test('201 — admin creates an admin account without a team', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', adminToken)
      .send({
        name:     'Second Admin',
        email:    'admin2@test.local',
        password: 'Admin@456',
        role:     'admin',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('admin');
    expect(res.body.data.teamId).toBeNull();
  });

  test('400 — teamId is required for a staff account', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', adminToken)
      .send({ name: 'X', email: 'x@test.local', password: 'Password123', role: 'staff' });
    expect(res.status).toBe(400);
  });

  test('400 — non-existent teamId is rejected', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', adminToken)
      .send({
        name: 'X', email: 'x@test.local', password: 'Password123',
        role: 'staff', teamId: '00000000-0000-0000-0000-000000000000',
      });
    expect(res.status).toBe(400);
  });

  test('409 — duplicate email is rejected', async () => {
    const payload = {
      name: 'X', email: 'dup@test.local', password: 'Password123',
      role: 'staff', teamId: ids.teamId,
    };
    await request(app).post('/api/v1/users').set('Authorization', adminToken).send(payload);
    const res = await request(app).post('/api/v1/users').set('Authorization', adminToken).send(payload);
    expect(res.status).toBe(409);
  });

  test('400 — role: "customer" is not allowed via this endpoint', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', adminToken)
      .send({ name: 'C', email: 'c@test.local', password: 'Password123', role: 'customer' });
    expect(res.status).toBe(400);
  });

  test('403 — customer cannot access this endpoint', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', customerToken)
      .send({ name: 'X', email: 'x@test.local', password: 'Password123', role: 'staff', teamId: ids.teamId });
    expect(res.status).toBe(403);
  });

  test('403 — staff cannot access this endpoint', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', staffToken)
      .send({ name: 'X', email: 'x@test.local', password: 'Password123', role: 'staff', teamId: ids.teamId });
    expect(res.status).toBe(403);
  });
});

// ─── GET /users ───────────────────────────────────────────────────────────────

describe('GET /api/v1/users', () => {
  test('200 — admin can list all users', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', adminToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3); // admin, staff, customer from seed
  });

  test('?role filter returns only matching role', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', adminToken)
      .query({ role: 'staff' });
    expect(res.status).toBe(200);
    res.body.data.forEach((u) => expect(u.role_name).toBe('staff'));
  });

  test('?teamId filter returns only users in that team', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', adminToken)
      .query({ teamId: ids.teamId });
    expect(res.status).toBe(200);
    res.body.data.forEach((u) => expect(u.team_id).toBe(ids.teamId));
  });

  test('403 — customer cannot list users', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', customerToken);
    expect(res.status).toBe(403);
  });
});

// ─── GET /teams/:id/staff ─────────────────────────────────────────────────────

describe('GET /api/v1/teams/:id/staff', () => {
  test('200 — returns active staff and managers in the team', async () => {
    const res = await request(app)
      .get(`/api/v1/teams/${ids.teamId}/staff`)
      .set('Authorization', adminToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    // every entry should have the fields the AssignForm dropdown needs
    res.body.data.forEach((s) => {
      expect(s).toHaveProperty('id');
      expect(s).toHaveProperty('name');
      expect(s).toHaveProperty('role_name');
    });
  });

  test('404 — non-existent team id returns NOT_FOUND', async () => {
    const res = await request(app)
      .get('/api/v1/teams/00000000-0000-0000-0000-000000000000/staff')
      .set('Authorization', adminToken);
    expect(res.status).toBe(404);
  });

  test('403 — customer cannot access team staff roster', async () => {
    const res = await request(app)
      .get(`/api/v1/teams/${ids.teamId}/staff`)
      .set('Authorization', customerToken);
    expect(res.status).toBe(403);
  });
});
