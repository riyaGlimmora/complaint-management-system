// migrations/seed.js
// Seeds a couple of teams, products, and one admin account so the API is usable immediately
// after migrating. Safe to re-run: uses ON CONFLICT to avoid duplicate inserts.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    const { rows: roles } = await client.query('SELECT id, name FROM roles');
    const roleId = (name) => roles.find((r) => r.name === name).id;

    // Teams
    await client.query(
      `INSERT INTO teams (name) VALUES ('Hardware Support'), ('Software Support'), ('Billing Team')
       ON CONFLICT (name) DO NOTHING;`
    );
    const { rows: teams } = await client.query('SELECT id, name FROM teams');
    const teamId = (name) => teams.find((t) => t.name === name).id;

    // Products, mapped to the team that handles complaints about them
    await client.query(
      `INSERT INTO products (name, category, team_id) VALUES
        ('SmartPhone X1', 'Electronics', $1),
        ('Laptop Pro 14', 'Electronics', $1),
        ('CloudSuite App', 'Software', $2),
        ('Invoice Portal', 'Billing', $3)
       ON CONFLICT DO NOTHING;`,
      [teamId('Hardware Support'), teamId('Software Support'), teamId('Billing Team')]
    );

    // Admin account (change the password immediately after first login in a real deployment)
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
    await client.query(
      `INSERT INTO users (name, email, password_hash, role_id)
       VALUES ('System Admin', 'admin@glimmora.test', $1, $2)
       ON CONFLICT (email) DO NOTHING;`,
      [passwordHash, roleId('admin')]
    );

    console.log('Seed complete. Admin login: admin@glimmora.test / Admin@123');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
