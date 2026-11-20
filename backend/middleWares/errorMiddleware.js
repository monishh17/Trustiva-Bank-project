import AppError from "../utils/AppError.js";

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// Express 5 forwards errors thrown in async handlers here automatically.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let error = err;

  if (err.type === "entity.parse.failed") {
    error = new AppError("Request body is not valid JSON", 400);
  } else if (err.type === "entity.too.large") {
    error = new AppError("Request body is too large", 413);
  }

  const status = error.statusCode || 500;

  if (status === 500) {
    console.error(err);
  }

  // Never leak database or code details to the browser.
  res.status(status).json({
    success: false,
    message: status === 500 ? "Something went wrong. Please try again." : error.message,
  });
}
