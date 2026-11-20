import express from "express";
import * as transactionController from "../controllers/transactionController.js";

const router = express.Router();

router.get("/", transactionController.getTransactions);

export default router;
