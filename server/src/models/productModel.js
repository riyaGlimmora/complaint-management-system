// src/models/productModel.js
const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query(
    `SELECT p.*, t.name AS team_name
     FROM products p LEFT JOIN teams t ON t.id = p.team_id
     WHERE p.is_active = true
     ORDER BY p.name`
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create({ name, category, description, teamId }) {
  const { rows } = await pool.query(
    `INSERT INTO products (name, category, description, team_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, category || null, description || null, teamId]
  );
  return rows[0];
}

async function update(id, fields) {
  const setClauses = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(fields)) {
    const column = { teamId: 'team_id', isActive: 'is_active' }[key] || key;
    setClauses.push(`${column} = $${i}`);
    values.push(value);
    i += 1;
  }
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return rows[0] || null;
}

module.exports = { findAll, findById, create, update };
