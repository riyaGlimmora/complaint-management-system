// src/validations/productValidation.js
const Joi = require('joi');

const create = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  category: Joi.string().max(100).allow('', null),
  description: Joi.string().allow('', null),
  teamId: Joi.string().uuid().required(),
});

const update = Joi.object({
  name: Joi.string().min(2).max(150),
  category: Joi.string().max(100).allow('', null),
  description: Joi.string().allow('', null),
  teamId: Joi.string().uuid(),
  isActive: Joi.boolean(),
}).min(1);

module.exports = { create, update };
