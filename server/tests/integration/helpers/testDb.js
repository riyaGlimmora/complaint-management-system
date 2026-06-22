// tests/integration/helpers/testDb.js
// Sets up a real PostgreSQL connection for integration tests.
// Each test suite calls setupTestDb() in beforeAll, teardownTestDb() in afterAll,
// and clearTickets() / clearUsers() between tests to keep state isolated.
//
// REQUIREMENTS:
//   - TEST_DATABASE_URL in .env (or .env.test) pointing to a dedicated test DB
//   - That DB has the schema already migrated (run `npm run migrate` against it)
//
// Why a separate DB, not the dev DB? Integration tests INSERT and DELETE real rows.
// A separate DB keeps dev data safe and lets tests run in CI without side effects.

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
});

async function setupTestDb() {
  // Verify connectivity early so a misconfigured env fails fast with a clear message.
  await pool.query('SELECT 1');
}

async function teardownTestDb() {
  await pool.end();
}

// Wipe transactional data between tests. Roles and fixed lookup data stay.
// Order respects FK constraints: comments/history before tickets, tickets before users.
async function clearDb() {
  await pool.query('DELETE FROM attachments');
  await pool.query('DELETE FROM ticket_comments');
  await pool.query('DELETE FROM ticket_history');
  await pool.query('DELETE FROM tickets');
  await pool.query('DELETE FROM products');
  await pool.query('DELETE FROM users WHERE TRUE');
  await pool.query('DELETE FROM teams');
  await pool.query("SELECT setval('ticket_number_seq', 1, false)");
}

// Inserts the minimum set of lookup data (roles already seeded by migration)
// then returns useful IDs for test assertions.
async function seedBaseData() {
  // Roles were created by the migration — just fetch them.
  const { rows: roles } = await pool.query('SELECT id, name FROM roles');
  const roleId = (name) => roles.find((r) => r.name === name).id;

  // Team
  const { rows: [team] } = await pool.query(
    "INSERT INTO teams (name) VALUES ('Test Team') RETURNING id"
  );

  // Product mapped to that team
  const { rows: [product] } = await pool.query(
    'INSERT INTO products (name, category, team_id) VALUES ($1, $2, $3) RETURNING id',
    ['Test Product', 'Electronics', team.id]
  );

  // Admin user
  const bcrypt = require('bcryptjs');
  const hash   = await bcrypt.hash('Admin@123', 10);
  const { rows: [admin] } = await pool.query(
    'INSERT INTO users (name, email, password_hash, role_id) VALUES ($1,$2,$3,$4) RETURNING id',
    ['Test Admin', 'admin@test.local', hash, roleId('admin')]
  );

  // Staff user in that team
  const staffHash = await bcrypt.hash('Staff@123', 10);
  const { rows: [staff] } = await pool.query(
    'INSERT INTO users (name, email, password_hash, role_id, team_id) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    ['Test Staff', 'staff@test.local', staffHash, roleId('staff'), team.id]
  );

  // Customer
  const custHash = await bcrypt.hash('Cust@1234', 10);
  const { rows: [customer] } = await pool.query(
    'INSERT INTO users (name, email, password_hash, role_id) VALUES ($1,$2,$3,$4) RETURNING id',
    ['Test Customer', 'customer@test.local', custHash, roleId('customer')]
  );

  return {
    teamId:     team.id,
    productId:  product.id,
    adminId:    admin.id,
    staffId:    staff.id,
    customerId: customer.id,
  };
}

module.exports = { pool, setupTestDb, teardownTestDb, clearDb, seedBaseData };
