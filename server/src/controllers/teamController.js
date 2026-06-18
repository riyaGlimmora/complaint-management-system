// src/controllers/teamController.js
const teamService = require('../services/teamService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const teams = await teamService.listTeams();
  res.status(200).json({ data: teams });
});

const create = asyncHandler(async (req, res) => {
  const team = await teamService.createTeam(req.body);
  res.status(201).json({ data: team });
});

module.exports = { list, create };
