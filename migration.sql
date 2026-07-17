-- 1. Enable pgcrypto extension for bcrypt functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Add password_hash column to profiles table if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 3. Update existing profiles with a default bcrypt-hashed password 'password123'
-- This ensures existing quick-test accounts (e.g. ahmed@example.com, john@example.com, admin@domicare.com)
-- can still log in using the standard password.
UPDATE public.profiles
SET password_hash = crypt('123456', gen_salt('bf', 10))
WHERE password_hash IS NULL;
