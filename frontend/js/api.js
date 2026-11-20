// All communication with the backend goes through this file.
// Pages call Api.deposit(500), never fetch() directly.

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth && Session.getToken()) {
    headers.Authorization = `Bearer ${Session.getToken()}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Unable to connect to the server.", 0);
  }

  const data = await response.json().catch(() => ({}));

  // Token missing, expired or rejected: send the user back to login.
  if (response.status === 401 && auth) {
    Session.logout();
    throw new ApiError("Your session has expired. Please log in again.", 401);
  }

  if (!response.ok || data.success === false) {
    throw new ApiError(data.message || "Request failed.", response.status);
  }

  return data;
}

const Api = {
  // Public
  register: (details) =>
    apiRequest("/auth/register", { method: "POST", body: details, auth: false }),

  login: (username, password) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: { username, password },
      auth: false,
    }),

  resetPassword: (details) =>
    apiRequest("/auth/reset-password", {
      method: "POST",
      body: details,
      auth: false,
    }),

  // Private (need a login)
  getBalance: () => apiRequest("/accounts/balance"),

  deposit: (amount) =>
    apiRequest("/accounts/deposit", { method: "POST", body: { amount } }),

  withdraw: (amount) =>
    apiRequest("/accounts/withdraw", { method: "POST", body: { amount } }),

  getTransactions: () => apiRequest("/transactions"),

  createFixedDeposit: (amount, durationYears) =>
    apiRequest("/fixed-deposits", {
      method: "POST",
      body: { amount, durationYears },
    }),
};
