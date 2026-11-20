import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Resolve relative to the project, not the folder `node` was started from.
dotenv.config({
  path: fileURLToPath(new URL("../application.env", import.meta.url)),
});

// Fail fast with a clear message instead of crashing later.
const required = ["DB_HOST", "DB_USER", "DB_NAME", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Missing required settings in application.env: ${missing.join(", ")}`,
  );
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET in application.env must be at least 32 characters");
}
