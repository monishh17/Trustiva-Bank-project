-- CREATE DATABASE trustiva_bank;
-- USE trustiva_bank;
CREATE TABLE users (
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
    password VARCHAR(255) NOT NULL,

    account_number VARCHAR(20) UNIQUE,

    balance DECIMAL(10,2) DEFAULT 0,

    nominee_name VARCHAR(100),
    nominee_relation VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

USE trustiva_bank;

SELECT * FROM users;

select username,balance from users;


USE trustiva_bank;

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

USE trustiva_bank;

CREATE TABLE fixed_deposits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    duration_years INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DESCRIBE fixed_deposits;
SELECT * FROM fixed_deposits;

SELECT * FROM transactions;
SELECT * FROM users;