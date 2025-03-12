-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  image VARCHAR(255),
  coins INTEGER NOT NULL DEFAULT 0,
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for username and email searches
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- Create transactions table for user coins
CREATE TABLE IF NOT EXISTS user_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  novel_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for transaction queries
CREATE INDEX idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX idx_user_transactions_created_at ON user_transactions(created_at);

COMMENT ON TABLE users IS 'Stores user accounts information';
COMMENT ON COLUMN users.id IS 'Unique identifier for the user';
COMMENT ON COLUMN users.name IS 'Full name of the user';
COMMENT ON COLUMN users.username IS 'Unique username for the user';
COMMENT ON COLUMN users.email IS 'Email address of the user (unique)';
COMMENT ON COLUMN users.password IS 'Hashed password (null if using Google auth)';
COMMENT ON COLUMN users.google_id IS 'Google ID for OAuth authentication';
COMMENT ON COLUMN users.image IS 'URL to the user profile image';
COMMENT ON COLUMN users.coins IS 'Virtual currency balance for the user';
COMMENT ON COLUMN users.role IS 'User role - either user or admin';

COMMENT ON TABLE user_transactions IS 'Stores history of user coin transactions';
COMMENT ON COLUMN user_transactions.user_id IS 'Reference to the user who made the transaction';
COMMENT ON COLUMN user_transactions.amount IS 'Amount of coins (positive for additions, negative for deductions)';
COMMENT ON COLUMN user_transactions.description IS 'Description of the transaction';
COMMENT ON COLUMN user_transactions.novel_id IS 'Reference to novel if transaction is related to one'; 