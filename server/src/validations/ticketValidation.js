// src/validations/ticketValidation.js
const Joi = require('joi');

const create = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).required(),
  productId: Joi.string().uuid().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
});

const changeStatus = Joi.object({
  status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed', 'reopened').required(),
  note: Joi.string().max(1000).allow('', null),
});

const assign = Joi.object({
  staffId: Joi.string().uuid().required(),
  note: Joi.string().max(1000).allow('', null),
});

const addComment = Joi.object({
  commentText: Joi.string().min(1).max(2000).required(),
  isInternal: Joi.boolean().default(false),
});

const search = Joi.object({
  status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed', 'reopened'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  productId: Joi.string().uuid(),
  assignedStaffId: Joi.string().uuid(),
  assignedTeamId: Joi.string().uuid(),
  q: Joi.string().max(200),
  dateFrom: Joi.date().iso(),
  dateTo: Joi.date().iso(),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = { create, changeStatus, assign, addComment, search };
