// src/services/dashboardService.js
const dashboardModel = require('../models/dashboardModel');

async function staffPerformance(staffId) {
  const stats = await dashboardModel.staffPerformance(staffId);
  const timings = await dashboardModel.staffTicketTimings(staffId);
  return { summary: stats, ticketTimings: timings };
}

async function teamPerformance(teamId) {
  const summary = await dashboardModel.teamPerformance(teamId);
  const staffBreakdown = await dashboardModel.teamStaffBreakdown(teamId);
  return { summary, staffBreakdown };
}

async function productAnalysis() {
  return dashboardModel.productAnalysis();
}

module.exports = { staffPerformance, teamPerformance, productAnalysis };
