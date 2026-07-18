/**
 * Typed application error carrying an HTTP status code.
 * Route handlers throw this for validation failures (400); anything
 * uncaught (network errors, JSON parse failures, SDK errors) falls
 * through to the generic 500 branch in errorHandler.
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

/**
 * Wraps an async Express route handler so rejected promises reach
 * errorHandler instead of crashing the process.
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Express error-handling middleware — must be registered last, after
 * all routes, and must keep all four arguments so Express recognizes
 * it as an error handler.
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const timestamp = new Date().toISOString();

  console.error(`[${timestamp}] ERROR ${req.method} ${req.originalUrl} -> ${statusCode}: ${err.message}`);
  if (err.rawResponse) {
    console.error(`[${timestamp}] Raw Claude response that failed to parse:`, err.rawResponse);
  }
  if (statusCode >= 500 && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    error: err.message || "Internal server error",
    status: "error",
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: `No route matches ${req.method} ${req.originalUrl}`,
    status: "error",
  });
}
