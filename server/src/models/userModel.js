// src/models/userModel.js
// Data access layer for `users`. Every query here is parameterized - no string
// concatenation - to rule out SQL injection.

const pool = require('../config/db');

async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT u.*, r.name AS role_name
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.email = $1`,
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.team_id, u.is_active, u.created_at, r.name AS role_name
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ name, email, passwordHash, roleId }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role_id, created_at`,
    [name, email, passwordHash, roleId]
  );
  return rows[0];
}

// Used by admin user-management: creates a staff/manager/admin account with an
// optional team assignment, separate from the public 'customer' self-registration path.
async function createWithTeam({ name, email, passwordHash, roleId, teamId }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role_id, team_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role_id, team_id, created_at`,
    [name, email, passwordHash, roleId, teamId || null]
  );
  return rows[0];
}

// Admin "manage users" listing, optionally filtered by team and/or role.
async function findAll({ teamId, role } = {}) {
  const conditions = [];
  const values = [];

  if (teamId) {
    values.push(teamId);
    conditions.push(`u.team_id = $${values.length}`);
  }
  if (role) {
    values.push(role);
    conditions.push(`r.name = $${values.length}`);
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.team_id, u.is_active, u.created_at, r.name AS role_name
     FROM users u JOIN roles r ON r.id = u.role_id
     ${whereSql}
     ORDER BY u.name`,
    values
  );
  return rows;
}

async function getRoleIdByName(roleName) {
  const { rows } = await pool.query('SELECT id FROM roles WHERE name = $1', [roleName]);
  return rows[0]?.id || null;
}

// Active staff belonging to a team, used by the auto-assignment service.
async function findActiveStaffInTeam(teamId) {
  const { rows } = await pool.query(
    `SELECT u.id
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.team_id = $1 AND u.is_active = true AND r.name IN ('staff', 'manager')`,
    [teamId]
  );
  return rows;
}

// Same roster, with name + role included - used by the "Assign ticket" dropdown
// in the UI, where the auto-assignment service's bare id list isn't enough.
async function findActiveStaffInTeamWithNames(teamId) {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.team_id = $1 AND u.is_active = true AND r.name IN ('staff', 'manager')
     ORDER BY u.name`,
    [teamId]
  );
  return rows;
}

module.exports = {
  findByEmail,
  findById,
  create,
  createWithTeam,
  findAll,
  getRoleIdByName,
  findActiveStaffInTeam,
  findActiveStaffInTeamWithNames,
};
