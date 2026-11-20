import pool from "../config/db.js";
import AppError from "../utils/AppError.js";
import { dbError } from "../utils/dbErrors.js";

// All money movement goes through here so it is always:
//   1. done inside a database transaction (passed in as `connection`)
//   2. recorded in the transactions table
//   3. safe against two requests changing the same balance at once

const BALANCE_TOO_HIGH = {
  ER_WARN_DATA_OUT_OF_RANGE: "This would exceed the maximum account balance",
  ER_DATA_OUT_OF_RANGE: "This would exceed the maximum account balance",
};

// Locks the user's row until the transaction ends.
async function lockAccount(connection, username) {
  const [rows] = await connection.query(
    "SELECT id FROM users WHERE username = ? FOR UPDATE",
    [username],
  );

  if (rows.length === 0) {
    throw new AppError("Account not found", 404);
  }
}

async function readBalance(connection, username) {
  const [rows] = await connection.query(
    "SELECT balance FROM users WHERE username = ?",
    [username],
  );

  return Number(rows[0].balance);
}

export async function recordTransaction(connection, username, type, amount) {
  await connection.query(
    "INSERT INTO transactions (username, type, amount) VALUES (?, ?, ?)",
    [username, type, amount],
  );
}

// Adds money. Returns the new balance.
export async function credit(connection, username, amount, type = "Deposit") {
  await lockAccount(connection, username);

  try {
    await connection.query(
      "UPDATE users SET balance = balance + ? WHERE username = ?",
      [amount, username],
    );
  } catch (error) {
    throw dbError(error, BALANCE_TOO_HIGH);
  }

  await recordTransaction(connection, username, type, amount);

  return readBalance(connection, username);
}

// Removes money. Returns the new balance.
export async function debit(connection, username, amount, type = "Withdrawal") {
  await lockAccount(connection, username);

  const [result] = await connection.query(
    "UPDATE users SET balance = balance - ? WHERE username = ? AND balance >= ?",
    [amount, username, amount],
  );

  if (result.affectedRows === 0) {
    throw new AppError("Insufficient balance", 400);
  }

  await recordTransaction(connection, username, type, amount);

  return readBalance(connection, username);
}

export async function getBalance(username) {
  const [rows] = await pool.query(
    "SELECT balance FROM users WHERE username = ?",
    [username],
  );

  if (rows.length === 0) {
    throw new AppError("Account not found", 404);
  }

  return Number(rows[0].balance);
}
