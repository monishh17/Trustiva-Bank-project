import AppError from "./AppError.js";

export const MAX_AMOUNT = 10_000_000;
export const MAX_FD_YEARS = 10;

const ACCOUNT_TYPES = ["Savings", "Current"];
const GENDERS = ["Male", "Female", "Other"];

// Validates a money amount and returns it as a number with 2 decimals.
export function parseAmount(value) {
  const isNumberLike = typeof value === "number" || typeof value === "string";
  const amount = isNumberLike && value !== "" ? Number(value) : NaN;

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError("Enter a valid amount", 400);
  }

  const rounded = Math.round(amount * 100) / 100;

  if (Math.abs(rounded - amount) > 1e-9) {
    throw new AppError("Amount can have at most 2 decimal places", 400);
  }

  if (rounded > MAX_AMOUNT) {
    throw new AppError(
      `Amount cannot be more than ₹${MAX_AMOUNT.toLocaleString("en-IN")}`,
      400,
    );
  }

  return rounded;
}

export function parseYears(value) {
  const years = Number(value);

  if (!Number.isInteger(years) || years < 1 || years > MAX_FD_YEARS) {
    throw new AppError(
      `Duration must be a whole number from 1 to ${MAX_FD_YEARS} years`,
      400,
    );
  }

  return years;
}

export function requireText(value, label, { min = 1, max = 255 } = {}) {
  const text = typeof value === "string" ? value.trim() : "";

  if (text.length < min) {
    throw new AppError(`${label} is required`, 400);
  }

  if (text.length > max) {
    throw new AppError(`${label} must be at most ${max} characters`, 400);
  }

  return text;
}

export function requirePassword(value, label = "Password") {
  // Passwords are never trimmed or altered.
  if (typeof value !== "string" || value.length < 8) {
    throw new AppError(`${label} must be at least 8 characters`, 400);
  }

  if (value.length > 72) {
    // bcrypt only uses the first 72 bytes.
    throw new AppError(`${label} must be at most 72 characters`, 400);
  }

  return value;
}

export function requireDate(value, label) {
  const text = requireText(value, label, { max: 10 });
  const date = new Date(`${text}T00:00:00Z`);

  const isValid =
    /^\d{4}-\d{2}-\d{2}$/.test(text) &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === text;

  if (!isValid || date > new Date()) {
    throw new AppError(`${label} is not a valid date`, 400);
  }

  return text;
}

export function requirePhone(value) {
  const phone = requireText(value, "Phone number", { max: 15 });

  if (!/^\+?\d{10,14}$/.test(phone)) {
    throw new AppError("Enter a valid phone number", 400);
  }

  return phone;
}

export function validateRegistration(body = {}) {
  const email = requireText(body.email, "Email", { max: 100 });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError("Enter a valid email address", 400);
  }

  const gender = requireText(body.gender, "Gender");

  if (!GENDERS.includes(gender)) {
    throw new AppError("Select a valid gender", 400);
  }

  const accountType = requireText(body.accountType, "Account type");

  if (!ACCOUNT_TYPES.includes(accountType)) {
    throw new AppError("Select a valid account type", 400);
  }

  const username = requireText(body.username, "Username", { min: 3, max: 30 });

  if (!/^[A-Za-z0-9_.-]+$/.test(username)) {
    throw new AppError(
      "Username can only contain letters, numbers, dots, dashes and underscores",
      400,
    );
  }

  const pincode = requireText(body.pincode, "PIN code", { max: 10 });

  if (!/^\d{6}$/.test(pincode)) {
    throw new AppError("PIN code must be 6 digits", 400);
  }

  const rawDeposit = body.initialDeposit ?? 0;
  const initialDeposit = rawDeposit === "" || Number(rawDeposit) === 0
    ? 0
    : parseAmount(rawDeposit);

  return {
    fullName: requireText(body.fullName, "Full name", { min: 2, max: 100 }),
    dob: requireDate(body.dob, "Date of birth"),
    gender,
    phone: requirePhone(body.phone),
    email,
    city: requireText(body.city, "City", { max: 50 }),
    state: requireText(body.state, "State", { max: 50 }),
    address: requireText(body.address, "Address", { max: 255 }),
    pincode,
    accountType,
    username,
    password: requirePassword(body.password),
    initialDeposit,
    nomineeName: requireText(body.nomineeName, "Nominee name", { max: 100 }),
    nomineeRelation: requireText(body.nomineeRelation, "Nominee relation", {
      max: 50,
    }),
  };
}
