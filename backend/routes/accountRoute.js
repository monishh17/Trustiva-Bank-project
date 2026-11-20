import express from "express";
import * as accountController from "../controllers/accountController.js";

const router = express.Router();

router.get("/balance", accountController.getBalance);
router.post("/deposit", accountController.deposit);
router.post("/withdraw", accountController.withdraw);

export default router;
