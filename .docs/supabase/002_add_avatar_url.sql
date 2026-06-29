-- M12.1: Add avatar_url to profiles table
-- Run this in Supabase SQL Editor (dev project first, then prod)

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url text;
