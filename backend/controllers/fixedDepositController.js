import { withTransaction } from "../config/db.js";
import * as accountService from "../services/accountService.js";
import { parseAmount, parseYears } from "../utils/validators.js";

export async function createFixedDeposit(req, res) {
  const amount = parseAmount(req.body?.amount);
  const durationYears = parseYears(req.body?.durationYears);
  const { username } = req.user;

  // Money leaves the account, the FD is created and the transaction is
  // recorded together. If any step fails, none of them happen.
  const balance = await withTransaction(async (connection) => {
    const newBalance = await accountService.debit(
      connection,
      username,
      amount,
      "Fixed Deposit",
    );

    await connection.query(
      `INSERT INTO fixed_deposits (username, amount, duration_years)
       VALUES (?, ?, ?)`,
      [username, amount, durationYears],
    );

    return newBalance;
  });

  res.status(201).json({
    success: true,
    message: "Fixed deposit created successfully",
    balance,
  });
}
