// src/services/authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

async function register({ name, email, password }) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // All public self-registration creates 'customer' accounts. Staff, manager,
  // and admin accounts are provisioned by an admin via the user management routes.
  const roleId = await userModel.getRoleIdByName('customer');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userModel.create({ name, email, passwordHash, roleId });

  return { id: user.id, name: user.name, email: user.email };
}

async function login({ email, password }) {
  const user = await userModel.findByEmail(email);
  if (!user || !user.is_active) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = jwt.sign(
    { id: user.id, role: user.role_name, teamId: user.team_id, name: user.name },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role_name },
  };
}

module.exports = { register, login };
