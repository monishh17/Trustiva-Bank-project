# Trustiva Bank

```
trustiva-bank/
├── backend/            Node.js + Express + MySQL API
│   ├── server.js       starts the server
│   ├── app.js          middleware and routes
│   ├── application.env settings (DB login, JWT secret)
│   ├── config/         env loading, database pool + transactions
│   ├── routes/         URL → controller
│   ├── controllers/    request handling
│   ├── services/       money movement (deposit / withdraw), used by controllers
│   ├── middleWares/    login check, error handling, rate limiting
│   └── utils/          AppError, validation
├── frontend/           plain HTML / CSS / JS (no build step)
│   ├── index.html      login
│   ├── pages/          every other page
│   ├── css/            base, components, auth, app
│   ├── js/             config, session, api, ui + one script per page (js/pages)
│   └── assets/images/
└── database/
    ├── schema.sql                     new database
    └── migrations/001_harden_schema.sql  existing database
```

## Run it

1. **Database.** New database: run `database/schema.sql`.
   Existing database: run `database/migrations/001_harden_schema.sql`.
2. **Backend.**
   ```
   cd backend
   npm install
   npm start          (or: npm run dev   to restart on changes)
   ```
   Check `application.env` first (DB password etc.). You should see
   `MySQL connected successfully` and `Server running on http://localhost:3000`.
3. **Frontend.** Open `frontend/index.html` in the browser (VS Code Live Server
   works well). If the backend is on a different address, change
   `frontend/js/config.js`.

## API

All routes start with `/api`. Private routes need `Authorization: Bearer <token>`.

| Method | Route | Private | Body |
|---|---|---|---|
| POST | `/auth/register` | no | fullName, dob, gender, phone, email, city, state, address, pincode, accountType, username, password, initialDeposit, nomineeName, nomineeRelation |
| POST | `/auth/login` | no | username, password |
| POST | `/auth/reset-password` | no | username, phone, dob, newPassword |
| GET | `/accounts/balance` | yes | |
| POST | `/accounts/deposit` | yes | amount |
| POST | `/accounts/withdraw` | yes | amount |
| GET | `/transactions` | yes | |
| POST | `/fixed-deposits` | yes | amount, durationYears (1–10) |

Every response has `success: true/false` and, on failure, a `message`.

## What changed from the original and why

**Security**
- Passwords are stored as bcrypt hashes. Existing plain-text passwords are
  upgraded automatically the next time each user logs in.
- Login returns a token. Private routes use the username *inside the token*,
  so one user can no longer read or change another user's account by editing a
  request. (Before, any request that named a username was trusted.)
- Password reset used to need only a username. It now also needs the phone
  number and date of birth given at registration.
- Login, register and reset are rate limited.
- The old `POST /transaction` endpoint is gone. The server records transactions
  itself, so history can't be forged from the browser.

**Money**
- Deposit, withdraw and fixed deposit run inside database transactions with the
  account row locked. Two requests at once can no longer lose money, and a
  fixed deposit can no longer deduct money without creating the deposit.
- Amounts are validated on the server (positive, at most 2 decimals, at most
  ₹1,00,00,000). Before, a non-number could slip through.
- The opening deposit now appears in transaction history, so history adds up
  to the balance.

**Frontend**
- One 1,000-line `bank.js` split into shared modules plus one small script per page.
- Deposit and withdraw pages showed ₹0 until you acted; they now load the real balance.
- Every private page redirects to login when nobody is logged in.
- Enter now submits forms. The account number is shown after registering.
- Dashboard cards are real links; transaction history shows + / − with colour.

**Removed** (unused leftovers): `bank.html`, `bank2.css`, the half-finished
`backend/src/` copy, and the empty `models/` and `services/` stubs there.

## Known limits

- Password reset by phone + date of birth is a stop-gap. A real system should
  email a one-time link; that needs an email service.
- `application.env` holds real secrets and is in `.gitignore`. Don't commit it.
