// src/services/teamService.js
const teamModel = require('../models/teamModel');

async function listTeams() {
  return teamModel.findAll();
}

async function createTeam(data) {
  return teamModel.create(data);
}

module.exports = { listTeams, createTeam };
