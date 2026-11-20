import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

// Reads "Authorization: Bearer <token>" and sets req.user.
// Everything that touches an account uses req.user.username,
// never a username sent by the browser.
export function protect(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Please log in to continue", 401);
  }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.user = { username: payload.username };
  } catch {
    throw new AppError("Your session has expired. Please log in again", 401);
  }

  next();
}
