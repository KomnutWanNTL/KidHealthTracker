-- ============================================
-- KidHealth Tracker: profiles table migration
-- Run in dev project (kidhealth-dev) first
-- Project URL: https://qkgpacyhjuexhbcsyyxo.supabase.co
-- ============================================
-- Note: assumes set_updated_at() function already exists
-- from daily_logs migration. If not, create it first.

-- Verify after running:
--   select * from public.profiles;
-- Expected: empty table (0 rows), no error

-- 1. สร้างตาราง profiles (1:1 กับ auth.users)
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  first_name     text not null default '',
  last_name      text not null default '',
  child_name     text not null default '',
  child_birthday date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 2. เปิด RLS
alter table public.profiles enable row level security;

-- 3. Policy: user จัดการได้เฉพาะ profile ตัวเอง
create policy "Users manage own profile"
  on public.profiles
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Trigger: อัปเดต updated_at อัตโนมัติ
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
