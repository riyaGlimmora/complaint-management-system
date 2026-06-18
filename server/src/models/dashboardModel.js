// src/models/dashboardModel.js
// Read-heavy aggregation queries backing the Performance Dashboard.
// All rely on the indexes from the migration (status, assigned_staff_id,
// assigned_team_id, product_id, created_at) to stay fast as ticket volume grows.

const pool = require('../config/db');

async function staffPerformance(staffId) {
  const { rows } = await pool.query(
    `SELECT
        COUNT(*) AS total_assigned,
        COUNT(*) FILTER (WHERE status IN ('resolved', 'closed')) AS completed,
        COUNT(*) FILTER (WHERE status IN ('open', 'in_progress')) AS pending,
        AVG(resolved_at - created_at) FILTER (WHERE resolved_at IS NOT NULL) AS avg_resolution_time
     FROM tickets
     WHERE assigned_staff_id = $1`,
    [staffId]
  );
  return rows[0];
}

// Per-ticket resolution time for a staff member, e.g. for a "time per ticket" table.
async function staffTicketTimings(staffId) {
  const { rows } = await pool.query(
    `SELECT ticket_number, title, status, created_at, resolved_at, closed_at,
            (resolved_at - created_at) AS resolution_time
     FROM tickets
     WHERE assigned_staff_id = $1
     ORDER BY created_at DESC`,
    [staffId]
  );
  return rows;
}

async function teamPerformance(teamId) {
  const { rows } = await pool.query(
    `SELECT
        COUNT(*) AS total_tickets,
        COUNT(*) FILTER (WHERE status IN ('resolved', 'closed')) AS completed,
        COUNT(*) FILTER (WHERE status IN ('open', 'in_progress')) AS backlog,
        AVG(resolved_at - created_at) FILTER (WHERE resolved_at IS NOT NULL) AS avg_resolution_time
     FROM tickets
     WHERE assigned_team_id = $1`,
    [teamId]
  );
  return rows[0];
}

// Per-staff breakdown within one team - "team performance metrics" + "staff-wise" combined view.
async function teamStaffBreakdown(teamId) {
  const { rows } = await pool.query(
    `SELECT u.id AS staff_id, u.name AS staff_name,
            COUNT(t.id) AS total_assigned,
            COUNT(t.id) FILTER (WHERE t.status IN ('resolved', 'closed')) AS completed,
            COUNT(t.id) FILTER (WHERE t.status IN ('open', 'in_progress')) AS pending,
            AVG(t.resolved_at - t.created_at) FILTER (WHERE t.resolved_at IS NOT NULL) AS avg_resolution_time
     FROM users u
     LEFT JOIN tickets t ON t.assigned_staff_id = u.id
     WHERE u.team_id = $1
     GROUP BY u.id, u.name
     ORDER BY u.name`,
    [teamId]
  );
  return rows;
}

async function productAnalysis() {
  const { rows } = await pool.query(
    `SELECT p.id AS product_id, p.name AS product_name,
            COUNT(t.id) AS total_complaints,
            COUNT(t.id) FILTER (WHERE t.status IN ('open', 'in_progress')) AS open_complaints,
            AVG(t.resolved_at - t.created_at) FILTER (WHERE t.resolved_at IS NOT NULL) AS avg_resolution_time
     FROM products p
     LEFT JOIN tickets t ON t.product_id = p.id
     GROUP BY p.id, p.name
     ORDER BY total_complaints DESC`
  );
  return rows;
}

module.exports = {
  staffPerformance,
  staffTicketTimings,
  teamPerformance,
  teamStaffBreakdown,
  productAnalysis,
};
