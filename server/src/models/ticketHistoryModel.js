// src/models/ticketHistoryModel.js
// Append-only audit log. Rows here are never updated or deleted - this is what
// makes "Ticket History & Activity Logs" and resolution-time metrics trustworthy.

const pool = require('../config/db');

async function log({ ticketId, actorId, actionType, oldValue, newValue, note }) {
  const { rows } = await pool.query(
    `INSERT INTO ticket_history (ticket_id, actor_id, action_type, old_value, new_value, note)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [ticketId, actorId, actionType, oldValue || null, newValue || null, note || null]
  );
  return rows[0];
}

async function findByTicketId(ticketId) {
  const { rows } = await pool.query(
    `SELECT h.*, u.name AS actor_name
     FROM ticket_history h
     LEFT JOIN users u ON u.id = h.actor_id
     WHERE h.ticket_id = $1
     ORDER BY h.created_at ASC`,
    [ticketId]
  );
  return rows;
}

module.exports = { log, findByTicketId };
