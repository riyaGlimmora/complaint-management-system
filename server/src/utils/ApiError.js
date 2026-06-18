// src/utils/ApiError.js
// A typed error so the error-handling middleware can return the right status code
// and a clean message, instead of leaking raw exceptions to the client.

class ApiError extends Error {
  constructor(statusCode, message, code = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || defaultCodeFor(statusCode);
    this.isApiError = true;
  }

  static badRequest(message, code) {
    return new ApiError(400, message, code);
  }
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }
  static notFound(message = 'Not found') {
    return new ApiError(404, message);
  }
  static conflict(message) {
    return new ApiError(409, message);
  }
}

function defaultCodeFor(statusCode) {
  const map = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
  };
  return map[statusCode] || 'INTERNAL_ERROR';
}

module.exports = ApiError;
