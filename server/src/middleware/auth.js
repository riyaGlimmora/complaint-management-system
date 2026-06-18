// src/middleware/auth.js
// Two pieces: `authenticate` verifies the JWT and attaches req.user.
// `authorize(...roles)` then checks req.user.role against an allow-list.
// Every protected route uses both, in that order.

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload; // { id, role, teamId, name }
    next();
  } catch (err) {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
