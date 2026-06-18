// src/validations/teamValidation.js
const Joi = require('joi');

const create = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  leadId: Joi.string().uuid().allow(null),
});

module.exports = { create };
