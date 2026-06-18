// src/models/commentModel.js
const pool = require('../config/db');

async function create({ ticketId, userId, commentText, isInternal }) {
  const { rows } = await pool.query(
    `INSERT INTO ticket_comments (ticket_id, user_id, comment_text, is_internal)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [ticketId, userId, commentText, isInternal || false]
  );
  return rows[0];
}

// `includeInternal` is false for customer-facing requests, so internal staff
// notes never leak to the customer who raised the ticket.
async function findByTicketId(ticketId, includeInternal) {
  const sql = includeInternal
    ? `SELECT c.*, u.name AS author_name FROM ticket_comments c
       JOIN users u ON u.id = c.user_id WHERE c.ticket_id = $1 ORDER BY c.created_at ASC`
    : `SELECT c.*, u.name AS author_name FROM ticket_comments c
       JOIN users u ON u.id = c.user_id WHERE c.ticket_id = $1 AND c.is_internal = false
       ORDER BY c.created_at ASC`;

  const { rows } = await pool.query(sql, [ticketId]);
  return rows;
}

module.exports = { create, findByTicketId };
