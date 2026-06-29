-- ============================================
-- KidHealth Tracker: Seed test data for all months
-- Run in Supabase SQL Editor (dev project first)
-- ============================================
-- Usage:
--   1. เปิด Supabase Dashboard → SQL Editor
--   2. วาง script นี้
--   3. รัน (อาจรันหลายรอบเพื่อสุ่ม symptom ต่างกัน)
--   4. ไปที่ SummaryPage → เลือกเดือน → Export PDF
-- ============================================

do $$
declare
  v_user_id uuid := 'e348debe-b557-4b6e-b48f-b245aad3f3d7';
  v_start_date date := '2026-01-01';
  v_end_date date := '2026-12-31';
  v_current date;
  v_symptoms text[] := array['NORMAL','RUNNY_CLEAR','RUNNY_GREEN','FEVER','FEVER_RUNNY_CLEAR','FEVER_RUNNY_GREEN'];
  v_symptom text;
  v_rand int;
begin
  v_current := v_start_date;
  while v_current <= v_end_date loop
    -- สุ่ม symptom: 70% NORMAL, 30% อื่น ๆ
    v_rand := floor(random() * 100);
    if v_rand < 70 then
      v_symptom := 'NORMAL';
    else
      v_symptom := v_symptoms[1 + floor(random() * (array_length(v_symptoms, 1) - 1))];
    end if;

    insert into public.daily_logs (user_id, log_date, symptom)
    values (v_user_id, v_current, v_symptom)
    on conflict (user_id, log_date) do nothing;

    v_current := v_current + 1;
  end loop;
end;
$$;

-- Verify
select
  log_date,
  symptom
from public.daily_logs
where user_id = 'e348debe-b557-4b6e-b48f-b245aad3f3d7'
  and log_date between '2026-01-01' and '2026-12-31'
order by log_date;

-- Count per month
select
  to_char(log_date, 'YYYY-MM') as month,
  count(*) as days,
  count(*) filter (where symptom != 'NORMAL') as sick_days
from public.daily_logs
where user_id = 'e348debe-b557-4b6e-b48f-b245aad3f3d7'
  and log_date between '2026-01-01' and '2026-12-31'
group by month
order by month;
