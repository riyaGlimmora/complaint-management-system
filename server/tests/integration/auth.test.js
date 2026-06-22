// tests/integration/auth.test.js
// Tests the full register → login flow against the real Express app + DB.
// Validates: request validation, password hashing, JWT issuance, duplicate email,
// wrong password rejection, and that the token is usable on a protected endpoint.

const request = require('supertest');
const app     = require('../../src/app');
const { setupTestDb, teardownTestDb, clearDb } = require('./helpers/testDb');

beforeAll(setupTestDb);
afterAll(teardownTestDb);
beforeEach(clearDb);

describe('POST /api/v1/auth/register', () => {
  const VALID = { name: 'Asha Rao', email: 'asha@test.local', password: 'Password123' };

  test('201 — creates a customer account and returns id/name/email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(VALID);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'Asha Rao', email: 'asha@test.local' });
    expect(res.body.data).not.toHaveProperty('password');
    expect(res.body.data).not.toHaveProperty('password_hash');
  });

  test('409 — duplicate email is rejected', async () => {
    await request(app).post('/api/v1/auth/register').send(VALID);
    const res = await request(app).post('/api/v1/auth/register').send(VALID);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  test('400 — missing name returns VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'x@test.local', password: 'Password123' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('400 — password shorter than 8 characters is rejected', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'X', email: 'x@test.local', password: 'short' });
    expect(res.status).toBe(400);
  });

  test('400 — invalid email format is rejected', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'X', email: 'not-an-email', password: 'Password123' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  const CREDS = { email: 'login@test.local', password: 'Password123' };

  beforeEach(async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Login User', ...CREDS });
  });

  test('200 — returns token and user object (no sensitive fields)', async () => {
    const res = await request(app).post('/api/v1/auth/login').send(CREDS);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toMatchObject({ email: CREDS.email, role: 'customer' });
    expect(res.body.data.user).not.toHaveProperty('password_hash');
  });

  test('the returned token grants access to a protected endpoint', async () => {
    const loginRes = await request(app).post('/api/v1/auth/login').send(CREDS);
    const token = loginRes.body.data.token;

    const protectedRes = await request(app)
      .get('/api/v1/tickets/search')
      .set('Authorization', `Bearer ${token}`);
    expect(protectedRes.status).toBe(200);
  });

  test('401 — wrong password is rejected', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: CREDS.email, password: 'WrongPass1' });
    expect(res.status).toBe(401);
  });

  test('401 — non-existent email is rejected', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@test.local', password: 'Password123' });
    expect(res.status).toBe(401);
  });

  test('401 — request without Authorization header is rejected on protected routes', async () => {
    const res = await request(app).get('/api/v1/tickets/search');
    expect(res.status).toBe(401);
  });
});
