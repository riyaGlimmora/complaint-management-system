// src/services/ticketService.js
const ticketModel = require('../models/ticketModel');
const ticketHistoryModel = require('../models/ticketHistoryModel');
const commentModel = require('../models/commentModel');
const productModel = require('../models/productModel');
const { generateTicketNumber } = require('../utils/ticketNumber');
const assignmentService = require('./assignmentService');
const ApiError = require('../utils/ApiError');

// Valid forward transitions for the ticket lifecycle state machine described
// in the design doc. Anything not listed here is rejected with a 400, so a
// ticket can never silently jump into an invalid state.
const ALLOWED_TRANSITIONS = {
  open: ['in_progress'],
  in_progress: ['resolved'],
  resolved: ['closed', 'reopened'],
  reopened: ['in_progress'],
  closed: [],
};

async function createTicket({ title, description, productId, priority, customerId }) {
  const product = await productModel.findById(productId);
  if (!product) {
    throw ApiError.badRequest('Product does not exist', 'PRODUCT_NOT_FOUND');
  }

  const ticketNumber = await generateTicketNumber();
  const ticket = await ticketModel.create({
    ticketNumber,
    title,
    description,
    productId,
    customerId,
    priority,
  });

  await ticketHistoryModel.log({
    ticketId: ticket.id,
    actorId: customerId,
    actionType: 'created',
    newValue: 'open',
    note: 'Ticket created by customer.',
  });

  // Routing happens immediately on creation, per the "Auto Assignment to
  // Product Teams" requirement - the customer never has to wait for a human
  // to triage which team should see this.
  const assigned = await assignmentService.autoAssign(ticket);
  return assigned;
}

async function getTicketDetail(ticketId, requestingUser) {
  const ticket = await ticketModel.findById(ticketId);
  if (!ticket) {
    throw ApiError.notFound('Ticket not found');
  }
  assertCanView(ticket, requestingUser);

  const includeInternal = requestingUser.role !== 'customer';
  const [history, comments] = await Promise.all([
    ticketHistoryModel.findByTicketId(ticketId),
    commentModel.findByTicketId(ticketId, includeInternal),
  ]);

  return { ticket, history, comments };
}

function assertCanView(ticket, requestingUser) {
  if (requestingUser.role === 'admin') return;
  if (requestingUser.role === 'customer' && ticket.customer_id === requestingUser.id) return;
  if (requestingUser.role === 'staff' && ticket.assigned_staff_id === requestingUser.id) return;
  if (requestingUser.role === 'manager' && ticket.assigned_team_id === requestingUser.teamId)
    return;
  throw ApiError.forbidden('You do not have access to this ticket');
}

async function changeStatus(ticketId, newStatus, actorId, note) {
  const ticket = await ticketModel.findById(ticketId);
  if (!ticket) {
    throw ApiError.notFound('Ticket not found');
  }

  if (ticket.status === newStatus) {
    // Treat a repeated request for the same status as a no-op (idempotent PATCH),
    // not an error and not a duplicate history entry.
    return ticket;
  }

  const allowedNext = ALLOWED_TRANSITIONS[ticket.status] || [];
  if (!allowedNext.includes(newStatus)) {
    throw ApiError.badRequest(
      `Cannot move ticket from '${ticket.status}' to '${newStatus}'`,
      'INVALID_TRANSITION'
    );
  }

  const updated = await ticketModel.updateStatus(ticketId, newStatus);
  await ticketHistoryModel.log({
    ticketId,
    actorId,
    actionType: 'status_change',
    oldValue: ticket.status,
    newValue: newStatus,
    note,
  });

  return updated;
}

async function reassign(ticketId, staffId, actorId, note) {
  const ticket = await ticketModel.findById(ticketId);
  if (!ticket) {
    throw ApiError.notFound('Ticket not found');
  }

  const updated = await ticketModel.assign(ticketId, {
    teamId: ticket.assigned_team_id,
    staffId,
  });

  await ticketHistoryModel.log({
    ticketId,
    actorId,
    actionType: 'assignment',
    oldValue: ticket.assigned_staff_id,
    newValue: staffId,
    note,
  });

  return updated;
}

async function addComment(ticketId, userId, commentText, isInternal, requestingUser) {
  const ticket = await ticketModel.findById(ticketId);
  if (!ticket) {
    throw ApiError.notFound('Ticket not found');
  }
  assertCanView(ticket, requestingUser);

  // A customer can never post a staff-only internal note, regardless of what
  // the request body claims - this is enforced here, not just on the frontend.
  const effectiveIsInternal = requestingUser.role === 'customer' ? false : isInternal;

  const comment = await commentModel.create({
    ticketId,
    userId,
    commentText,
    isInternal: effectiveIsInternal,
  });

  await ticketHistoryModel.log({
    ticketId,
    actorId: userId,
    actionType: 'comment',
    note: effectiveIsInternal ? 'Internal note added.' : 'Comment added.',
  });

  return comment;
}

async function searchTickets(filters, requestingUser) {
  return ticketModel.search(filters, requestingUser);
}

module.exports = {
  createTicket,
  getTicketDetail,
  changeStatus,
  reassign,
  addComment,
  searchTickets,
};
