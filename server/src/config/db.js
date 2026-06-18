// src/config/db.js
// Single shared connection pool. Every model imports this rather than creating
// its own client, so the app doesn't exhaust database connections under load.

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  // A background, idle client error should not crash the whole process.
  console.error('Unexpected error on idle database client', err);
});

module.exports = pool;
