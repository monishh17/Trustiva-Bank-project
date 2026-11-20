import crypto from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import pool, { withTransaction } from "../config/db.js";
import AppError from "../utils/AppError.js";
import {
  requireDate,
  requirePassword,
  requirePhone,
  requireText,
  validateRegistration,
} from "../utils/validators.js";
import { recordTransaction } from "../services/accountService.js";

const SALT_ROUNDS = 12;

// Compared against when the username doesn't exist, so a wrong username and a
// wrong password take about the same time and can't be told apart.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", SALT_ROUNDS);

function generateAccountNumber() {
  return `TRUST${crypto.randomInt(100000, 1000000)}`;
}

function safeEqual(a, b) {
  const first = Buffer.from(a);
  const second = Buffer.from(b);

  return first.length === second.length && crypto.timingSafeEqual(first, second);
}

// Inserts the user, retrying if the random account number is already taken.
async function insertUser(connection, data, passwordHash) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const accountNumber = generateAccountNumber();

    try {
      await connection.query(
        `INSERT INTO users
           (full_name, dob, gender, phone, email, city, state, address,
            pincode, account_type, username, password, account_number,
            balance, nominee_name, nominee_relation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.fullName,
          data.dob,
          data.gender,
          data.phone,
          data.email,
          data.city,
          data.state,
          data.address,
          data.pincode,
          data.accountType,
          data.username,
          passwordHash,
          accountNumber,
          data.initialDeposit,
          data.nomineeName,
          data.nomineeRelation,
        ],
      );

      return accountNumber;
    } catch (error) {
      if (error.code !== "ER_DUP_ENTRY") {
        throw error;
      }

      if (!String(error.sqlMessage).includes("account_number")) {
        throw new AppError("That username is already taken", 409);
      }
      // Account number collision: loop and try a new one.
    }
  }

  throw new Error("Could not generate a unique account number");
}

export async function register(req, res) {
  const data = validateRegistration(req.body);
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const accountNumber = await withTransaction(async (connection) => {
    const number = await insertUser(connection, data, passwordHash);

    if (data.initialDeposit > 0) {
      await recordTransaction(
        connection,
        data.username,
        "Initial Deposit",
        data.initialDeposit,
      );
    }

    return number;
  });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    accountNumber,
  });
}

// Accounts created before this update have plain-text passwords. They can still
// log in once, and the password is replaced by a hash at that moment.
async function checkPassword(user, password) {
  if (user.password.startsWith("$2")) {
    return bcrypt.compare(password, user.password);
  }

  if (!safeEqual(user.password, password)) {
    return false;
  }

  const upgradedHash = await bcrypt.hash(password, SALT_ROUNDS);

  await pool.query("UPDATE users SET password = ? WHERE id = ?", [
    upgradedHash,
    user.id,
  ]);

  return true;
}

export async function login(req, res) {
  const username = requireText(req.body?.username, "Username", { max: 50 });
  const password = requireText(req.body?.password, "Password", { max: 72 });

  const [rows] = await pool.query(
    `SELECT id, username, password, full_name, account_number
     FROM users
     WHERE username = ?`,
    [username],
  );

  const user = rows[0];

  const isValid = user
    ? await checkPassword(user, password)
    : await bcrypt.compare(password, DUMMY_HASH);

  if (!isValid) {
    throw new AppError("Invalid username or password", 401);
  }

  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });

  res.json({
    success: true,
    message: "Login successful",
    token,
    user: {
      username: user.username,
      fullName: user.full_name,
      accountNumber: user.account_number,
    },
  });
}

// There is no email/SMS service, so identity is checked with details given at
// registration. Replace with an emailed one-time link when one is available.
export async function resetPassword(req, res) {
  const username = requireText(req.body?.username, "Username", { max: 50 });
  const phone = requirePhone(req.body?.phone);
  const dob = requireDate(req.body?.dob, "Date of birth");
  const newPassword = requirePassword(req.body?.newPassword, "New password");

  const [rows] = await pool.query(
    `SELECT id
     FROM users
     WHERE username = ?
       AND phone = ?
       AND DATE_FORMAT(dob, '%Y-%m-%d') = ?`,
    [username, phone, dob],
  );

  if (rows.length === 0) {
    // Same message whichever detail was wrong.
    throw new AppError("The details you entered do not match our records", 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await pool.query("UPDATE users SET password = ? WHERE id = ?", [
    passwordHash,
    rows[0].id,
  ]);

  res.json({ success: true, message: "Password reset successfully" });
}
