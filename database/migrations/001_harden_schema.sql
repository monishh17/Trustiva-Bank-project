-- For a database you already have (your existing trustiva_bank data is kept).
-- Needs MySQL 8.0.16 or newer. Safe to run once.
--
-- Passwords do NOT need migrating here: existing plain-text passwords are
-- converted to bcrypt hashes automatically the first time each user logs in.

USE trustiva_bank;

-- A balance can never go negative, even if application code has a bug.
ALTER TABLE users MODIFY balance DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE users ADD CONSTRAINT chk_users_balance CHECK (balance >= 0);

-- Faster transaction history and fixed deposit lookups.
CREATE INDEX idx_transactions_user_date ON transactions (username, transaction_date);
CREATE INDEX idx_fixed_deposits_user ON fixed_deposits (username);
