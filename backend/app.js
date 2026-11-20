import "./config/env.js";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./routes/authRoute.js";
import accountRouter from "./routes/accountRoute.js";
import transactionRouter from "./routes/transactionRoute.js";
import fixedDepositRouter from "./routes/fixedDepositRoute.js";

import { protect } from "./middleWares/authMiddleware.js";
import { authLimiter } from "./middleWares/rateLimitMiddleware.js";
import { notFound, errorHandler } from "./middleWares/errorMiddleware.js";

const appObj = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, "../frontend");

const corsOrigin = process.env.CORS_ORIGIN || "*";

appObj.disable("x-powered-by");

appObj.use(
  cors({
    origin:
      corsOrigin === "*"
        ? "*"
        : corsOrigin.split(",").map((o) => o.trim()),
  }),
);

appObj.use(express.json({ limit: "10kb" }));

// Public: register, login, reset password
appObj.use("/api/auth", authLimiter, authRouter);

// Private: need a valid login token
appObj.use("/api/accounts", protect, accountRouter);
appObj.use("/api/transactions", protect, transactionRouter);
appObj.use("/api/fixed-deposits", protect, fixedDepositRouter);

// Serve frontend
appObj.use(express.static(frontendPath));

appObj.use(notFound);
appObj.use(errorHandler);

export default appObj;