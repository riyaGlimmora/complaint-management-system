// src/controllers/dashboardController.js
const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const staffPerformance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Staff may only view their own metrics; managers/admins may view anyone's.
  if (req.user.role === 'staff' && req.user.id !== id) {
    throw ApiError.forbidden('You can only view your own performance metrics');
  }
  const data = await dashboardService.staffPerformance(id);
  res.status(200).json({ data });
});

const teamPerformance = asyncHandler(async (req, res) => {
  const data = await dashboardService.teamPerformance(req.params.id);
  res.status(200).json({ data });
});

const productAnalysis = asyncHandler(async (req, res) => {
  const data = await dashboardService.productAnalysis();
  res.status(200).json({ data });
});

module.exports = { staffPerformance, teamPerformance, productAnalysis };
