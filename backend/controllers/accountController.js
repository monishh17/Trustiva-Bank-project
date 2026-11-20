import { withTransaction } from "../config/db.js";
import * as accountService from "../services/accountService.js";
import { parseAmount } from "../utils/validators.js";

export async function getBalance(req, res) {
  const balance = await accountService.getBalance(req.user.username);

  res.json({ success: true, balance });
}

export async function deposit(req, res) {
  const amount = parseAmount(req.body?.amount);

  const balance = await withTransaction((connection) =>
    accountService.credit(connection, req.user.username, amount, "Deposit"),
  );

  res.json({
    success: true,
    message: "Amount deposited successfully",
    balance,
  });
}

export async function withdraw(req, res) {
  const amount = parseAmount(req.body?.amount);

  const balance = await withTransaction((connection) =>
    accountService.debit(connection, req.user.username, amount, "Withdrawal"),
  );

  res.json({
    success: true,
    message: "Amount withdrawn successfully",
    balance,
  });
}
