// src/controllers/ticketController.js
const ticketService = require('../services/ticketService');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const ticket = await ticketService.createTicket({
    ...req.body,
    customerId: req.user.id,
  });
  res.status(201).json({ data: ticket });
});

const getById = asyncHandler(async (req, res) => {
  const detail = await ticketService.getTicketDetail(req.params.id, req.user);
  res.status(200).json({ data: detail });
});

const search = asyncHandler(async (req, res) => {
  const result = await ticketService.searchTickets(req.query, req.user);
  res.status(200).json({ data: result });
});

const changeStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const updated = await ticketService.changeStatus(req.params.id, status, req.user.id, note);
  res.status(200).json({ data: updated });
});

const assign = asyncHandler(async (req, res) => {
  const { staffId, note } = req.body;
  const updated = await ticketService.reassign(req.params.id, staffId, req.user.id, note);
  res.status(200).json({ data: updated });
});

const addComment = asyncHandler(async (req, res) => {
  const { commentText, isInternal } = req.body;
  const comment = await ticketService.addComment(
    req.params.id,
    req.user.id,
    commentText,
    isInternal,
    req.user
  );
  res.status(201).json({ data: comment });
});

module.exports = { create, getById, search, changeStatus, assign, addComment };
