// src/validations/userValidation.js
const Joi = require('joi');

// Admins provision staff/manager/admin accounts through this schema.
// 'customer' is deliberately excluded - customers self-register via /auth/register.
const createStaffUser = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(8).max(72).required(),
  role: Joi.string().valid('staff', 'manager', 'admin').required(),
  teamId: Joi.string()
    .uuid()
    .when('role', { is: Joi.valid('staff', 'manager'), then: Joi.required(), otherwise: Joi.allow(null) }),
});

const listUsersQuery = Joi.object({
  teamId: Joi.string().uuid(),
  role: Joi.string().valid('admin', 'manager', 'staff', 'customer'),
});

module.exports = { createStaffUser, listUsersQuery };
