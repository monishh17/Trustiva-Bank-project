import express from "express";
import * as fixedDepositController from "../controllers/fixedDepositController.js";

const router = express.Router();

router.post("/", fixedDepositController.createFixedDeposit);

export default router;
