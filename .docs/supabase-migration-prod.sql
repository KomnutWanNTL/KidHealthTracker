-- ============================================
-- KidHealth Tracker: Prod Migration
-- Project: kidhealth-prod (njadmgqzywqqqbrmxssl)
-- ============================================

-- 1. daily_logs table
create table if not exists public.daily_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  log_date    date not null,
  symptom     text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint daily_logs_user_date_unique unique (user_id, log_date),
  constraint daily_logs_symptom_check check (
    symptom in ('NORMAL','RUNNY_CLEAR','FEVER','FEVER_RUNNY_CLEAR','FEVER_RUNNY_GREEN')
  )
);

-- 2. RLS
alter table public.daily_logs enable row level security;

create policy "Users manage own logs"
  on public.daily_logs
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Trigger function + trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_daily_logs_updated_at on public.daily_logs;
create trigger trg_daily_logs_updated_at
  before update on public.daily_logs
  for each row execute function public.set_updated_at();

-- 4. Index
create index if not exists daily_logs_user_month_idx
  on public.daily_logs (user_id, log_date);

-- 5. profiles table
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  first_name     text not null default '',
  last_name      text not null default '',
  child_name     text not null default '',
  child_birthday date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 6. RLS for profiles
alter table public.profiles enable row level security;

create policy "Users manage own profile"
  on public.profiles
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- 7. Trigger for profiles
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
