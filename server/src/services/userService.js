// src/services/userService.js
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const teamModel = require('../models/teamModel');
const ApiError = require('../utils/ApiError');

async function createStaffUser({ name, email, password, role, teamId }) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // staff and manager accounts must belong to a real team; admin accounts don't need one.
  if (['staff', 'manager'].includes(role)) {
    const team = await teamModel.findById(teamId);
    if (!team) {
      throw ApiError.badRequest('teamId does not refer to an existing team');
    }
  }

  const roleId = await userModel.getRoleIdByName(role);
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userModel.createWithTeam({
    name,
    email,
    passwordHash,
    roleId,
    teamId: ['staff', 'manager'].includes(role) ? teamId : null,
  });

  return { id: user.id, name: user.name, email: user.email, role, teamId: user.team_id };
}

async function listUsers(filters) {
  return userModel.findAll(filters);
}

module.exports = { createStaffUser, listUsers };
