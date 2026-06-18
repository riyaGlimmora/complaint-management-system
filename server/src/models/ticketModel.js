// src/models/ticketModel.js
const pool = require('../config/db');

async function create({ ticketNumber, title, description, productId, customerId, priority }) {
  const { rows } = await pool.query(
    `INSERT INTO tickets (ticket_number, title, description, product_id, customer_id, priority)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [ticketNumber, title, description, productId, customerId, priority]
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT t.*, p.name AS product_name, c.name AS customer_name,
            s.name AS assigned_staff_name, tm.name AS assigned_team_name
     FROM tickets t
     JOIN products p ON p.id = t.product_id
     JOIN users c ON c.id = t.customer_id
     LEFT JOIN users s ON s.id = t.assigned_staff_id
     LEFT JOIN teams tm ON tm.id = t.assigned_team_id
     WHERE t.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function assign(ticketId, { teamId, staffId }) {
  const { rows } = await pool.query(
    `UPDATE tickets SET assigned_team_id = $1, assigned_staff_id = $2, updated_at = now()
     WHERE id = $3 RETURNING *`,
    [teamId, staffId, ticketId]
  );
  return rows[0];
}

async function updateStatus(ticketId, status) {
  // resolved_at / closed_at are stamped here, in one place, so every metric
  // that depends on them (avg resolution time, etc.) is always accurate.
  const timestampColumn =
    status === 'resolved' ? 'resolved_at' : status === 'closed' ? 'closed_at' : null;

  const sql = timestampColumn
    ? `UPDATE tickets SET status = $1, updated_at = now(), ${timestampColumn} = now() WHERE id = $2 RETURNING *`
    : `UPDATE tickets SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`;

  const { rows } = await pool.query(sql, [status, ticketId]);
  return rows[0];
}

// Count of currently-open-or-in-progress tickets per staff member in a team.
// Used by the auto-assignment service to pick the least-loaded agent.
async function countActiveTicketsByStaff(teamId) {
  const { rows } = await pool.query(
    `SELECT u.id AS staff_id, COUNT(t.id) AS active_count
     FROM users u
     LEFT JOIN tickets t
       ON t.assigned_staff_id = u.id AND t.status IN ('open', 'in_progress')
     WHERE u.team_id = $1 AND u.is_active = true
     GROUP BY u.id
     ORDER BY active_count ASC`,
    [teamId]
  );
  return rows;
}

/**
 * Builds a parameterized WHERE clause for ticket search, combining:
 *  - role-based scoping (customers see only their own tickets, staff only
 *    their assigned tickets, managers only their team's tickets, admin sees all)
 *  - explicit filters (status, priority, product, etc.)
 *  - free-text search across title and ticket_number
 * Returns { whereSql, values } ready to splice into a query.
 */
function buildWhereClause(filters, requestingUser) {
  const conditions = [];
  const values = [];

  const addCondition = (sqlTemplate, value) => {
    values.push(value);
    conditions.push(sqlTemplate.replace('$?', `$${values.length}`));
  };

  if (requestingUser.role === 'customer') {
    addCondition('t.customer_id = $?', requestingUser.id);
  } else if (requestingUser.role === 'staff') {
    addCondition('t.assigned_staff_id = $?', requestingUser.id);
  } else if (requestingUser.role === 'manager') {
    addCondition('t.assigned_team_id = $?', requestingUser.teamId);
  }
  // admin: no scoping condition - sees everything, subject to filters below.

  if (filters.status) addCondition('t.status = $?', filters.status);
  if (filters.priority) addCondition('t.priority = $?', filters.priority);
  if (filters.productId) addCondition('t.product_id = $?', filters.productId);
  if (filters.assignedStaffId) addCondition('t.assigned_staff_id = $?', filters.assignedStaffId);
  if (filters.assignedTeamId) addCondition('t.assigned_team_id = $?', filters.assignedTeamId);
  if (filters.dateFrom) addCondition('t.created_at >= $?', filters.dateFrom);
  if (filters.dateTo) addCondition('t.created_at <= $?', filters.dateTo);

  if (filters.q) {
    const likeValue = `%${filters.q}%`;
    values.push(likeValue, likeValue);
    const titleIdx = values.length - 1;
    const numberIdx = values.length;
    conditions.push(`(t.title ILIKE $${titleIdx} OR t.ticket_number ILIKE $${numberIdx})`);
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereSql, values };
}

async function search(filters, requestingUser) {
  const { whereSql, values } = buildWhereClause(filters, requestingUser);

  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const offset = (page - 1) * pageSize;

  const limitIdx = values.length + 1;
  const offsetIdx = values.length + 2;

  const dataSql = `
    SELECT t.*, p.name AS product_name, s.name AS assigned_staff_name
    FROM tickets t
    JOIN products p ON p.id = t.product_id
    LEFT JOIN users s ON s.id = t.assigned_staff_id
    ${whereSql}
    ORDER BY t.created_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;
  const countSql = `SELECT COUNT(*) AS total FROM tickets t ${whereSql}`;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataSql, [...values, pageSize, offset]),
    pool.query(countSql, values),
  ]);

  return {
    items: dataResult.rows,
    total: parseInt(countResult.rows[0].total, 10),
    page,
    pageSize,
  };
}

module.exports = {
  create,
  findById,
  assign,
  updateStatus,
  countActiveTicketsByStaff,
  search,
};
