-- ============================================
-- KidHealth Tracker: add child_gender column
-- Run in dev project first
-- ============================================

-- Add child_gender column to profiles
alter table public.profiles
  add column if not exists child_gender text;

-- Optional: add check constraint for valid values
alter table public.profiles
  add constraint profiles_child_gender_check
  check (child_gender is null or child_gender in ('male', 'female'));

-- Verify:
--   select id, child_name, child_gender from public.profiles;
