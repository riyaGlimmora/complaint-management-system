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

module.exports = { findByEmail, findById, create, getRoleIdByName, findActiveStaffInTeam };
