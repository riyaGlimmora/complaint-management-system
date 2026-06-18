// src/utils/asyncHandler.js
// Wraps an async route handler so any thrown error / rejected promise is forwarded
// to Express's error-handling middleware, instead of needing try/catch everywhere.

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
