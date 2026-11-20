import pool from "../config/db.js";

// Transactions are created by the server when money moves (deposit, withdraw,
// fixed deposit, opening deposit). There is deliberately no "add transaction"
// endpoint, so history can't be forged from the browser.
export async function getTransactions(req, res) {
  const [rows] = await pool.query(
    `SELECT type, amount, transaction_date
     FROM transactions
     WHERE username = ?
     ORDER BY transaction_date DESC, id DESC`,
    [req.user.username],
  );

  res.json({ success: true, transactions: rows });
}
