// src/services/teamService.js
const teamModel = require('../models/teamModel');
const userModel = require('../models/userModel');
const ApiError = require('../utils/ApiError');

async function listTeams() {
  return teamModel.findAll();
}

async function createTeam(data) {
  return teamModel.create(data);
}

async function listTeamStaff(teamId) {
  const team = await teamModel.findById(teamId);
  if (!team) {
    throw ApiError.notFound('Team not found');
  }
  return userModel.findActiveStaffInTeamWithNames(teamId);
}

module.exports = { listTeams, createTeam, listTeamStaff };
