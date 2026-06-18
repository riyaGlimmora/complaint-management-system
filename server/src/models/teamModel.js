// src/models/teamModel.js
const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM teams ORDER BY name');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM teams WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create({ name, leadId }) {
  const { rows } = await pool.query(
    `INSERT INTO teams (name, lead_id) VALUES ($1, $2) RETURNING *`,
    [name, leadId || null]
  );
  return rows[0];
}

module.exports = { findAll, findById, create };
