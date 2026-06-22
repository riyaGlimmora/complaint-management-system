// tests/integration/helpers/dbGuard.js
// Run before the integration suite. If the database is unreachable, exits 0
// with a clear skip message rather than hanging on connection timeouts.
// Usage: node tests/integration/helpers/dbGuard.js

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
  connectionTimeoutMillis: 3000,
});

pool
  .query('SELECT 1')
  .then(() => {
    console.log('✓ DB reachable — running integration tests');
    pool.end();
    process.exit(0);
  })
  .catch((err) => {
    console.warn(
      '\n⚠  Integration tests SKIPPED: cannot reach the database.\n' +
      '   Set DATABASE_URL (or TEST_DATABASE_URL) in .env and run:\n' +
      '     npm run migrate   # once per test DB\n' +
      '     npm run test:integration\n' +
      `   Error: ${err.message}\n`
    );
    process.exit(2); // non-zero so the CI job can optionally flag it
  });
