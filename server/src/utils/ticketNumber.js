// src/utils/ticketNumber.js
// Generates the human-readable ticket identifier shown to users (e.g. TCK-000231),
// separate from the internal UUID primary key. Backed by a Postgres SEQUENCE so
// concurrent ticket creation never produces duplicate numbers.

const pool = require('../config/db');

async function generateTicketNumber() {
  const { rows } = await pool.query("SELECT nextval('ticket_number_seq') AS seq");
  const nextSeq = parseInt(rows[0].seq, 10);
  return `TCK-${String(nextSeq).padStart(6, '0')}`;
}

module.exports = { generateTicketNumber };
