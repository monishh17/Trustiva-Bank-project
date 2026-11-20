-- Trustiva Bank: full schema for a NEW database.
-- Needs MySQL 8.0.16 or newer (for CHECK constraints).
-- Already have data? Run migrations/001_harden_schema.sql instead.

CREATE DATABASE IF NOT EXISTS trustiva_bank;
USE trustiva_bank;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,
    dob DATE,
    gender VARCHAR(20),

    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100),

    city VARCHAR(50),
    state VARCHAR(50),
    address VARCHAR(255),
    pincode VARCHAR(10),

    account_type VARCHAR(20),

    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,          -- bcrypt hash (60 characters)

    account_number VARCHAR(20) UNIQUE,

    balance DECIMAL(10,2) NOT NULL DEFAULT 0,

    nominee_name VARCHAR(100),
    nominee_relation VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_users_balance CHECK (balance >= 0)
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,               -- Deposit, Withdrawal, Fixed Deposit, Initial Deposit
    amount DECIMAL(10,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_transactions_user_date (username, transaction_date),
    FOREIGN KEY (username) REFERENCES users (username)
);

CREATE TABLE IF NOT EXISTS fixed_deposits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    duration_years INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_fixed_deposits_user (username),
    FOREIGN KEY (username) REFERENCES users (username)
);
