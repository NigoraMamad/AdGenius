-- Migration: Add authentication fields to users table
-- Run this in your Supabase SQL editor

-- Add new columns to users table for Telegram authentication
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS language_code TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auth_provider TEXT CHECK (auth_provider IN ('telegram', 'google')),
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

    -- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can update own auth data" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;

-- Create updated RLS policies
CREATE POLICY "Users can update own auth data" ON users 
FOR UPDATE USING (auth.uid()::text = id::text);

-- Allow service role to manage users for authentication
CREATE POLICY "Service role can manage users" ON users 
FOR ALL USING (current_setting('role') = 'service_role');

-- Function to automatically update last_login_at
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_login_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update last_login_at when user data is updated
DROP TRIGGER IF EXISTS update_user_last_login ON users;
CREATE TRIGGER update_user_last_login 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    WHEN (OLD.updated_at IS DISTINCT FROM NEW.updated_at)
    EXECUTE FUNCTION update_last_login();

-- Comments for documentation
COMMENT ON COLUMN users.first_name IS 'User first name from authentication provider';
COMMENT ON COLUMN users.last_name IS 'User last name from authentication provider';
COMMENT ON COLUMN users.username IS 'Username from Telegram or other provider';
COMMENT ON COLUMN users.language_code IS 'User preferred language code (ISO 639-1)';
COMMENT ON COLUMN users.is_premium IS 'Whether user has premium features (Telegram Premium, etc.)';
COMMENT ON COLUMN users.auth_provider IS 'Authentication provider used (telegram, google)';
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last successful login'; 