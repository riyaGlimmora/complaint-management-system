// src/middleware/validate.js
// Generic middleware factory: pass a Joi schema, get back middleware that validates
// req.body (or req.query) and returns a clean 400 on failure instead of reaching
// the controller with bad data.

const ApiError = require('../utils/ApiError');

function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      return next(ApiError.badRequest(message, 'VALIDATION_ERROR'));
    }
    req.body = value;
    next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      return next(ApiError.badRequest(message, 'VALIDATION_ERROR'));
    }
    req.query = value;
    next();
  };
}

module.exports = { validateBody, validateQuery };
