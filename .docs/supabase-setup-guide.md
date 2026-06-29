# 🔧 Supabase Setup Guide สำหรับ KidHealth Tracker

> **ต้องทำ 2 projects:** `kidhealth-dev` (สำหรับ dev/test) และ `kidhealth-prod` (สำหรับ production จริง)

---

## 📌 Step 0: สร้าง Supabase Account

1. ไปที่ [supabase.com](https://supabase.com)
2. กด **"Start your project"** → Login ด้วย GitHub
3. ถ้าครั้งแรก → ยอมรับ Terms → เสร็จ

---

## 📌 Step 1: สร้าง Project `kidhealth-dev` (สำหรับ Dev)

> ทำเหมือนกัน 2 รอบ: dev ก่อน แล้วค่อย prod

1. ที่ [Supabase Dashboard](https://supabase.com/dashboard) → กด **"New project"**
2. กรอก:
   - **Name:** `kidhealth-dev`
   - **Database Password:** ตั้งรหัสผ่าน (จำไว้ หรือกด Generate → คัดลอกเก็บ)
   - **Region:** เลือกที่ใกล้ที่สุด เช่น **Singapore** (`ap-southeast-1`)
   - **Pricing Plan:** **Free** (พอสำหรับ dev)
3. กด **"Create new project"**
4. รอประมาณ 1-2 นาที จน database พร้อม (สถานะเป็น **"Available"** สีเขียว)

---

## 📌 Step 2: เปิด Confirm Email (Dev project เท่านั้น)

> ต้องเปิดใน dev project เท่านั้น prod จะเปิดหรือไม่เปิดก็ได้ (แนะนำให้เปิดทั้งคู่)

1. เปิด project `kidhealth-dev`
2. ไปที่เมนูซ้าย → **Authentication** → **Providers**
3. หา **Email** → กดปุ่มดินสอ (Edit)
4. เปิด toggle **"Confirm email"** → **ON**
5. กด **Save**

✅ เสร็จ — ตอนนี้เวลาสมัครสมาชิก Supabase จะส่ง confirmation email ให้

---

## 📌 Step 3: เอา API Keys (URL + Anon Key)

> ต้องเอาทั้ง dev และ prod project

1. เปิด project → ไปที่เมนูซ้าย → **Project Settings** (ไอคอนรูปเฟือง) → **API**
2. จะเจอค่าสองอย่าง:

| ค่า | ไว้ทำอะไร |
|---|---|
| **Project URL** | `https://xxxxx.supabase.co` |
| **anon public key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### วิธีใส่ใน env

เปิดไฟล์ `.env.development` แล้ววาง (ค่าจริงจาก dev project):

```env
VITE_SUPABASE_URL=https://qkgpacyhjuexhbcsyyxo.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_4ieVsF10rUhanyucfuZeyw_IhXprMFL
VITE_APP_ENV=development
```

เปิดไฟล์ `.env.production` แล้ววาง (ค่าจริงจาก prod project — **ห้าม commit**):

```env
VITE_SUPABASE_URL=https://njadmgqzywqqqbrmxssl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_WoNoXohgC67-pFY2NXAT6A_0Lon-K4a
VITE_APP_ENV=production
```

> ⚠️ `.env.production` **ห้าม commit ขึ้น Git** (อยู่ใน `.gitignore` อยู่แล้ว) — เก็บไว้ local + ใส่ใน Vercel Dashboard ทีหลัง

---

## 📌 Step 4: รัน SQL Migration (Create Table + RLS)

> **ต้องรันทั้ง dev และ prod project**

1. เปิด project → ไปที่เมนูซ้าย → **SQL Editor**
2. กด **"New query"**
3. วาง SQL ข้างล่างนี้ทั้งหมด แล้วกด ▶️ **Run** (หรือ `Cmd+Enter`)

```sql
-- ============================================
-- KidHealth Tracker: daily_logs table + RLS
-- ============================================

-- 1. สร้างตาราง daily_logs (รองรับ 6 symptoms)
create table public.daily_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  log_date    date not null,
  symptom     text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint daily_logs_user_date_unique unique (user_id, log_date),
  constraint daily_logs_symptom_check check (
    symptom in ('NORMAL','RUNNY_CLEAR','RUNNY_GREEN','FEVER','FEVER_RUNNY_CLEAR','FEVER_RUNNY_GREEN')
  )
);

-- 2. เปิด RLS (Row Level Security)
alter table public.daily_logs enable row level security;

-- 3. Policy: user จัดการได้เฉพาะข้อมูลตัวเอง
create policy "Users manage own logs"
  on public.daily_logs
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Trigger: อัปเดต updated_at อัตโนมัติ
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_daily_logs_updated_at
  before update on public.daily_logs
  for each row execute function public.set_updated_at();

-- 5. Index: ทำให้ query รายเดือนเร็วขึ้น
create index daily_logs_user_month_idx
  on public.daily_logs (user_id, log_date);

-- ============================================
-- KidHealth Tracker: profiles table + RLS
-- ============================================

-- 6. สร้างตาราง profiles (1:1 กับ auth.users)
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  first_name     text not null default '',
  last_name      text not null default '',
  child_name     text not null default '',
  child_birthday date,
  child_gender   text,
  avatar_url     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint profiles_child_gender_check
    check (child_gender is null or child_gender in ('male', 'female'))
);

-- 7. เปิด RLS
alter table public.profiles enable row level security;

-- 8. Policy: user จัดการได้เฉพาะ profile ตัวเอง
create policy "Users manage own profile"
  on public.profiles
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- 9. Trigger: อัปเดต updated_at อัตโนมัติ (ถ้าไม่มีฟังก์ชัน set_updated_at อยู่แล้ว ให้สร้างก่อน)
-- (create or replace function อยู่ด้านบนแล้ว ไม่ต้องสร้างซ้ำ)

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
```

### ✅ ถ้ารันสำเร็จ จะเห็นข้อความ:

```
Success. No rows returned
```

หรือ list of success messages ตามจำนวน statement

---

## 📌 Step 4b: เพิ่ม Symptom RUNNY_GREEN (ถ้า migration หลักยังไม่มี)

> **เฉพาะกรณี:** ถ้า migration หลัก (Step 4) รันไปก่อนที่ `RUNNY_GREEN` จะถูกเพิ่มเข้าไป

เปิดไฟล์ `.docs/supabase-migration-add-runny-green.sql` ใน SQL Editor แล้วรัน:

```sql
alter table public.daily_logs
  drop constraint if exists daily_logs_symptom_check;

alter table public.daily_logs
  add constraint daily_logs_symptom_check check (
    symptom in ('NORMAL','RUNNY_CLEAR','RUNNY_GREEN','FEVER','FEVER_RUNNY_CLEAR','FEVER_RUNNY_GREEN')
  );
```

---

## 📌 Step 4c: เพิ่ม child_gender column

เปิดไฟล์ `.docs/supabase-migration-add-child-gender.sql` ใน SQL Editor แล้วรัน:

```sql
alter table public.profiles
  add column if not exists child_gender text;

alter table public.profiles
  add constraint profiles_child_gender_check
  check (child_gender is null or child_gender in ('male', 'female'));
```

---

## 📌 Step 4d: เพิ่ม avatar_url column

เปิดไฟล์ `.docs/supabase/002_add_avatar_url.sql` ใน SQL Editor แล้วรัน:

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url text;
```

---

## 📌 Step 4e: สร้าง Storage bucket `avatars` + RLS policies

> ต้องทำทั้ง dev และ prod project (เฉพาะตอนตั้งค่าแรกเริ่ม)

เปิดไฟล์ `.docs/supabase/003_storage_avatars.sql` ใน SQL Editor แล้วรัน:

```sql
-- สร้าง bucket (public, max 2MB, allow image/jpeg + image/png)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true, 2097152,
  ARRAY['image/jpeg', 'image/png']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- RLS: INSERT — user upload to own folder only
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: SELECT — anyone can read (public bucket)
CREATE POLICY "Anyone can read avatars"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

-- RLS: UPDATE — user can update own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: DELETE — user can delete own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 📌 Step 5: สร้าง Test Users (Dev project)

> สร้างไว้สำหรับทดสอบตอนพัฒนา

### วิธีสร้าง user ผ่าน UI

1. เปิด project `kidhealth-dev`
2. ไปที่เมนูซ้าย → **Authentication** → **Users**
3. กด **"Invite"** หรือ **"Add user"** (แล้วแต่เวอร์ชัน)
4. กรอก:
   - **Email:** `test1@kidhealth.dev`
   - **Password:** `test1234`
5. กด **Create user**
6. ทำซ้ำสร้าง user ที่ 2: `test2@kidhealth.dev` / `test1234`

> หรือถ้าต้องการสร้างผ่าน SQL:
> ```sql
> -- วิธีนี้ต้องมี extensions pgcrypto
> select * from auth.sign_up('test1@kidhealth.dev', 'test1234');
> -- แต่แนะนำใช้ UI สะดวกกว่า
> ```

---

## 📌 Step 6: Insert Dummy Logs (Dev project)

> ใส่ข้อมูลตัวอย่างให้ test users เพื่อให้เห็นผลตอนพัฒนา

1. ไปที่ **SQL Editor** → New query
2. วาง SQL นี้ (เปลี่ยน UUID ให้ตรงกับ user ที่สร้าง):

```sql
-- หา user_id ก่อน (คัดลอก UUID ที่ได้ไปใช้)
select id, email from auth.users;

-- แล้ว insert dummy logs (เปลี่ยน user_id ด้านล่าง)
insert into public.daily_logs (user_id, log_date, symptom)
values
  ('ใส่-user-uuid-ตรงนี้', '2026-06-01', 'NORMAL'),
  ('ใส่-user-uuid-ตรงนี้', '2026-06-02', 'NORMAL'),
  ('ใส่-user-uuid-ตรงนี้', '2026-06-03', 'RUNNY_CLEAR'),
  ('ใส่-user-uuid-ตรงนี้', '2026-06-05', 'FEVER'),
  ('ใส่-user-uuid-ตรงนี้', '2026-06-06', 'FEVER_RUNNY_CLEAR'),
  ('ใส่-user-uuid-ตรงนี้', '2026-06-07', 'FEVER_RUNNY_GREEN'),
  ('ใส่-user-uuid-ตรงนี้', '2026-06-08', 'NORMAL'),
  ('ใส่-user-uuid-ตรงนี้', '2026-06-10', 'RUNNY_CLEAR'),
  ('ใส่-user-uuid-ตรงนี้', '2026-05-15', 'FEVER'),
  ('ใส่-user-uuid-ตรงนี้', '2026-05-20', 'NORMAL');
```

3. กด **Run**

### ✅ Verify

```sql
select * from public.daily_logs order by log_date;
```

ควรเห็น 10 rows ตามที่ insert

---

## 📌 Step 7: สร้าง Project `kidhealth-prod` (สำหรับ Production)

> ทำซ้ำ **Step 1, 3, 4, 4e** อีกครั้ง สำหรับ project ที่สอง  
> (Step 4e = Storage bucket เป็น optional แต่แนะนำให้ตั้ง)

ข้อแตกต่างสำหรับ prod:

| หัวข้อ | Dev | Prod |
|---|---|---|
| Project name | `kidhealth-dev` | `kidhealth-prod` |
| Region | Singapore (`ap-southeast-1`) | Singapore (`ap-southeast-1`) |
| Confirm email | ✅ เปิด | ✅ เปิด (แนะนำ) |
| Test users | ✅ มี | ❌ ไม่ต้องมี |
| Dummy data | ✅ มี | ❌ ไม่ต้องมี |
| API key ใน `.env.development` | ✅ ใช้ของ dev | ❌ |
| API key ใน `.env.production` | ❌ | ✅ ใช้ของ prod |
| Storage bucket `avatars` | ✅ ตั้ง (Step 4e) | ✅ ตั้ง (Step 4e) |

---

## 📌 Step 8: ทดสอบ RLS (Optional)

> เช็คว่า RLS ทำงานถูกต้อง: user A ดูข้อมูลของ user B ไม่ได้

1. เปิด **SQL Editor** ใน dev project
2. รัน:

```sql
-- ทดสอบในฐานะ user A
set role authenticated;
set request.jwt.claim.sub = '<user-A-uuid>';

-- ควรเห็นเฉพาะ logs ของ user A เท่านั้น
select * from public.daily_logs;
```

3. เปลี่ยนเป็น user B:

```sql
set request.jwt.claim.sub = '<user-B-uuid>';

-- ควรเห็นเฉพาะ logs ของ user B
select * from public.daily_logs;
```

✅ ถ้าแต่ละ user เห็นเฉพาะข้อมูลตัวเอง → RLS ทำงานถูกต้อง

---

## 🔍 เช็คลิสต์: เมื่อไหร่ถึง "พร้อม"

- [ ] มี 2 projects ใน Supabase dashboard: `kidhealth-dev` + `kidhealth-prod`
- [ ] `.env.development` มีค่า URL + anon key ของ dev project
- [ ] `.env.production` มีค่า URL + anon key ของ prod project (เก็บ local ไว้, gitignored)
- [ ] `daily_logs` table ถูกสร้างทั้ง 2 projects (พร้อม CHECK constraint 6 symptoms)
- [ ] `profiles` table ถูกสร้างทั้ง 2 projects (พร้อม child_gender + avatar_url columns)
- [ ] RLS policies ถูกเปิดทั้ง 2 projects (daily_logs + profiles)
- [ ] Storage bucket `avatars` สร้าง + RLS policies (ทั้ง 2 projects)
- [ ] Confirm email เปิดใน dev project (และ prod ด้วย ถ้าต้องการ)
- [ ] Test user + dummy data พร้อมใน dev

---

## ❓ ปัญหาที่พบบ่อย

| ปัญหา | สาเหตุ | แก้ยังไง |
|---|---|---|
| `relation "public.daily_logs" does not exist` | ยังไม่ได้รัน SQL | ไป SQL Editor → Run migration |
| `new row violates row-level security for table` | RLS policy ยังไม่ถูกต้อง | เช็ค policy ใน Authentication → Policies |
| `insufficient_privs` | ไม่ได้ใส่ `with check` | รัน migration ใหม่ให้ครบ |
| Confirm email ไม่ส่ง | ไม่ได้เปิด toggle | Auth → Providers → Email → Confirm email = ON |
| Anon key ไม่ทำงาน | คัดลอกไม่ครบ | เช็คใน Settings → API → anon key ทั้งบรรทัด |
| Avatar upload fails (401) | RLS Storage policy ไม่ถูกต้อง | รัน `003_storage_avatars.sql` อีกครั้ง |
| Avatar upload fails (413) | File ใหญ่เกิน 2MB | Client-side compress อยู่แล้ว (limit 700KB); เช็ค bucket config |
