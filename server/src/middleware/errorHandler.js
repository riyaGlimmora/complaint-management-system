// src/middleware/errorHandler.js
// The single place that turns any error - ApiError or unexpected exception -
// into a consistent JSON response. Never leaks stack traces outside development.

const env = require('../config/env');

function errorHandler(err, req, res, next) {
  const statusCode = err.isApiError ? err.statusCode : 500;
  const code = err.isApiError ? err.code : 'INTERNAL_ERROR';
  const message = err.isApiError ? err.message : 'Something went wrong on our end';

  if (!err.isApiError) {
    // Unexpected error: log full detail server-side, but never send it to the client.
    console.error('Unhandled error:', err);
  }

  const body = { error: { code, message } };
  if (env.nodeEnv === 'development' && !err.isApiError) {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
