// src/services/assignmentService.js
// Implements the least-loaded auto-assignment strategy described in the design doc:
// a ticket is routed to the team that handles its product, then to whichever
// active staff member in that team currently has the fewest open/in-progress tickets.

const productModel = require('../models/productModel');
const ticketModel = require('../models/ticketModel');
const teamModel = require('../models/teamModel');
const ticketHistoryModel = require('../models/ticketHistoryModel');

/**
 * Assigns a freshly-created ticket to a team and staff member.
 * Returns the updated ticket. Logs the assignment to ticket_history.
 */
async function autoAssign(ticket) {
  const product = await productModel.findById(ticket.product_id);

  if (!product || !product.team_id) {
    // No team mapped to this product: leave unassigned for an admin to triage,
    // rather than guessing or silently dropping the ticket.
    await ticketHistoryModel.log({
      ticketId: ticket.id,
      actorId: null,
      actionType: 'assignment',
      oldValue: null,
      newValue: 'unassigned',
      note: 'No team is mapped to this product; routed to the unassigned queue.',
    });
    return ticket;
  }

  const teamId = product.team_id;
  const workloads = await ticketModel.countActiveTicketsByStaff(teamId);

  let staffId = null;
  if (workloads.length > 0) {
    staffId = workloads[0].staff_id; // already ordered least-loaded first
  } else {
    // No active staff in the team at all: fall back to the team lead if one exists.
    const team = await teamModel.findById(teamId);
    staffId = team?.lead_id || null;
  }

  const updated = await ticketModel.assign(ticket.id, { teamId, staffId });

  await ticketHistoryModel.log({
    ticketId: ticket.id,
    actorId: null,
    actionType: 'assignment',
    oldValue: null,
    newValue: staffId ? `staff:${staffId}` : `team:${teamId}`,
    note: staffId
      ? 'Auto-assigned to least-loaded available staff member.'
      : 'Auto-assigned to team only; no active staff available.',
  });

  return updated;
}

module.exports = { autoAssign };
