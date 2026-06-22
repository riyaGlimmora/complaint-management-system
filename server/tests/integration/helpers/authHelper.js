// tests/integration/helpers/authHelper.js
// Returns a Bearer token for a given email/password by hitting the real login
// endpoint. This keeps integration tests honest — they use the same auth path
// a real client would, not a hand-crafted JWT.

const request = require('supertest');
const app = require('../../../src/app');

async function loginAs(email, password) {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });

  if (res.status !== 200) {
    throw new Error(`loginAs(${email}) failed: ${JSON.stringify(res.body)}`);
  }
  return `Bearer ${res.body.data.token}`;
}

module.exports = { loginAs };
