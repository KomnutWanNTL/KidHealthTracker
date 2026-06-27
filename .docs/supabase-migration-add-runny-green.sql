-- ============================================
-- KidHealth Tracker: add RUNNY_GREEN symptom
-- Run in dev project first
-- ============================================

-- Update CHECK constraint to allow RUNNY_GREEN
alter table public.daily_logs
  drop constraint if exists daily_logs_symptom_check;

alter table public.daily_logs
  add constraint daily_logs_symptom_check check (
    symptom in (
      'NORMAL',
      'RUNNY_CLEAR',
      'RUNNY_GREEN',
      'FEVER',
      'FEVER_RUNNY_CLEAR',
      'FEVER_RUNNY_GREEN'
    )
  );

-- Verify existing rows are unaffected
--   select count(*) from public.daily_logs;
--   select symptom, count(*) from public.daily_logs group by symptom;
