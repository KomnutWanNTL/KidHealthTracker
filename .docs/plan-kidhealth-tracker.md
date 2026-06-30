# 🗂️ Implementation Plan: KidHealth Tracker

> **Source:** `requirements-kidhealth-tracker.md` (v1)
> **Stack:** Vue 3 (Composition API) · Vite · Supabase (Auth + Postgres) · Vercel · Pinia · Tailwind CSS v4 · jsPDF + html2canvas · vite-plugin-pwa
> **Estimated Effort:** 10–14 working days (solo developer)

---

## 0. High-Level Milestones

| # | Milestone | Deliverable | Est. Days |
|---|---|---|---|---|---|
| M0 | Project bootstrap | Vite + Vue 3 + Tailwind + Supabase client + env files | 0.5 |
| M1 | Supabase backend | 2 projects (dev/prod), `daily_logs` + `profiles` table, RLS, seed | 0.5 |
| M2 | Auth (Login / Register / Logout) | Pinia auth store, guarded router, email confirm flow | 1.5 |
| M3 | Daily Log (Dashboard) | Date picker, SymptomCard grid, upsert, edit mode | 1.5 |
| M4 | Summary (Calendar view) | MonthPicker, CalendarGrid, counts, Legend | 1.5 |
| M5 | PDF Export | `useExportPdf` composable, A4 portrait, named file | 1.0 |
| M6 | UX polish | Toast, loading states, error states, responsive, a11y | 1.0 |
| M7 | Profile (ชื่อลูก, วันเกิด, อายุอัตโนมัติ) | `profiles` table, profile store, editable child info, age calc | 1.0 |
| M8 | Vercel deploy + env | Production env, preview env, smoke test | 0.5 |
| M9 | QA / UAT | Test matrix, Supabase test users, UAT pass | 1.5 |
| M17 | **Guest Mode** (v2.0.0) | Guest auth, localStorage data layer, guest UI, data migration | **2.0** |
| M18 | **UI Redesign — Profile** (v3.0.0) | Profile page redesigned per new mockup, child info card, stats cards, danger outlined logout | **1.0** |
| M19 | **Dark Mode** (v4.0.0) | Dark mode composable, `dark:` variants, CSS tokens, toggle UI, system pref detection | **1.0** |
| M20 | **Forgot Password** (v4.0.0) | ForgotPasswordPage, ResetPasswordPage, auth store recovery, Supabase config | **0.5** |
| **Total** | | | **~15.5 days** |

---

## 1. Phase Plan

### Phase 0 — Project Bootstrap (M0)
**Goal:** Runnable Vite app with environment switching wired up.

Tasks:
1. `npm create vite@latest kidhealth-tracker -- --template vue`
2. Install: `vue-router pinia @supabase/supabase-js tailwindcss @tailwindcss/vite jspdf html2canvas`
3. Add `@tailwindcss/vite` plugin in `vite.config.js` + `@import "tailwindcss"` in `style.css` (Tailwind v4 CSS-first config — no postcss.config.js or tailwind.config.js needed)
4. Create env files: `.env.development`, `.env.production`, `.env.local` (gitignored)
5. Create `src/lib/supabase.js` reading from `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
6. Verify `npm run dev` boots, env shows correct value in console

**Acceptance:**
- `npm run dev` loads `/` placeholder
- Console logs `VITE_APP_ENV=development`
- `supabase.auth.getSession()` returns `null` (no real call yet)

---

### Phase 1 — Supabase Backend (M1)
**Goal:** Two projects, schema, RLS, seed data.

Tasks:
1. Create **dev** project `kidhealth-dev` and **prod** project `kidhealth-prod` in Supabase dashboard
2. In both projects, run migration SQL:

```sql
-- daily_logs
create table public.daily_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  log_date    date not null,
  symptom     text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint daily_logs_user_date_unique unique (user_id, log_date),
  constraint daily_logs_symptom_check check (
    symptom in ('NORMAL','RUNNY_CLEAR','FEVER','FEVER_RUNNY_CLEAR','RUNNY_GREEN','FEVER_RUNNY_GREEN')
  )
);

-- RLS
alter table public.daily_logs enable row level security;

create policy "Users manage own logs"
  on public.daily_logs
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_daily_logs_updated_at
  before update on public.daily_logs
  for each row execute function public.set_updated_at();

-- helpful index for monthly fetch
create index daily_logs_user_month_idx
  on public.daily_logs (user_id, log_date);
```

3. In dev project: Auth → Providers → Email → **Enable "Confirm email"**
4. In dev project: manually create 2 test users for UAT
5. Insert 5–10 dummy logs for test users (covers multiple months)

**Acceptance:**
- SQL Editor reports no errors in both projects
- In dev, run `select * from daily_logs` shows test rows
- RLS verified: user A cannot see user B's rows (test via SQL with `set request.jwt.claim.sub`)

---

### Phase 2 — Authentication (M2)
**Goal:** Working login, register, logout, and route guards.

Tasks:
1. `src/stores/auth.js` (Pinia)
   - state: `session`, `user`, `loading`
   - actions: `init()`, `signIn(email,pw)`, `signUp(email,pw)`, `signOut()`, `onAuthChange`
   - calls `supabase.auth.*` and persists nothing locally (Supabase handles storage)
2. `src/router/index.js`
   - routes per spec table
   - `beforeEach` guard:
     - if route requires auth and no session → `/login`
     - if session exists and route is `/login` or `/register` → `/dashboard`
3. `src/pages/LoginPage.vue`
   - form: email + password
   - on submit → `auth.signIn()` → success → router.push('/dashboard')
   - show error from `AuthError.message`
4. `src/pages/RegisterPage.vue`
   - form: email + password + confirm
   - client validation: match, length ≥ 8
   - on submit → `auth.signUp()` → show "กรุณายืนยัน email" page (do not auto-login)
5. Logout button on Dashboard & Summary header → `auth.signOut()` → router.push('/login')
6. In `App.vue` or main: `await auth.init()` before mounting the app (handles `getSession()` + `onAuthStateChange`)

**Acceptance:**
- Register a new user → confirmation email received → click link → redirected to dashboard
- Login with bad password → red error message
- Visit `/dashboard` while logged out → redirected to `/login`
- Visit `/login` while logged in → redirected to `/dashboard`
- Logout works, session cleared

---

### Phase 3 — Daily Log / Dashboard (M3)
**Goal:** Record one symptom per day, edit existing, block future dates.

Tasks:
1. `src/constants/symptoms.js` — export `SYMPTOMS` array (code, label, color) per spec
2. `src/stores/logs.js` (Pinia)
   - state: `currentLog` (today's log), `monthLogs` (map keyed by YYYY-MM-DD)
   - actions: `fetchForDate(date)`, `fetchMonth(year, month)`, `upsertLog(date, symptom)`
3. `src/components/SymptomCard.vue`
   - props: `symptom` (object), `selected` (bool)
   - clickable card with background color from `symptom.color`
   - Tailwind: rounded-xl, ring-2 ring-transparent, ring-offset-2 when selected
4. `src/pages/DashboardPage.vue`
   - State: `selectedDate` (default today, max = today)
   - On mount / date change: `logs.fetchForDate(selectedDate)` → set `selectedSymptom` from result
    - Layout per spec mockup: 6 SymptomCards in 2-column grid (2 rows × 3 columns)
   - "บันทึก" button disabled until symptom selected
   - On save: `logs.upsertLog()` → toast "บันทึกแล้ว ✓" / error toast on failure
   - Link to `/summary`
   - Header with Logout
5. Date input: `<input type="date" :max="today">`

**Acceptance:**
- First-time user on today → empty state, save works
- Reload page → today's saved value is pre-selected
- Pick yesterday → loads yesterday's value (if any)
- Pick tomorrow → input is blocked (`max` attr + JS guard in store)
- Save without selection → button disabled

---

### Phase 4 — Summary / Calendar (M4)
**Goal:** Monthly grid with color-coded days, counts, legend.

Tasks:
1. `src/components/MonthPicker.vue`
   - emits `update:year`, `update:month`
   - `←` / `→` buttons + label `มกราคม 2569`
2. `src/components/CalendarGrid.vue`
   - Props: `yearMonth: { year, month }`, `logs: Map<dateString, symptomCode>`
   - Renders 7-col grid with weekday headers `อา จ อ พ พฤ ศ ส` (Thai locale)
   - For each day cell:
     - empty leading/trailing days → blank
     - future day → disabled, blank
     - past/today + no log → bg `#EEEEEE`
     - past/today + has log → bg = symptom color, white text
   - Each cell has `data-date` attribute (useful for export)
   - Exposes `ref` of root element for export
3. `src/pages/SummaryPage.vue`
   - State: `year`, `month` (default current)
   - On change: `logs.fetchMonth(year, month)` → render CalendarGrid
    - Legend: 6 rows from `SYMPTOMS`
   - Counts: tally each symptom from `monthLogs` → display `🟢 ปกติ: 18 วัน`, etc.
   - "Export PDF" button → calls `useExportPdf().exportCalendar(calendarRef, 'YYYY-MM')`
   - Header with Logout, link back to Dashboard
4. Helper in `logs.js`:
   ```js
   fetchMonth(year, month) {
     const from = `${year}-${pad(month)}-01`
     const to   = `${year}-${pad(month)}-31`  // safe; range filter handles it
     return supabase.from('daily_logs')
       .select('log_date, symptom')
       .eq('user_id', session.user.id)
       .gte('log_date', from)
       .lte('log_date', to)
   }
   ```

**Acceptance:**
- Switching month fetches new data within ~500ms
- Counts match the visible colored cells
- Future days in current month are blank/disabled
- No-data days are gray (`#EEEEEE`)

---

### Phase 5 — PDF Export (M5)
**Goal:** One-click download of `kidhealth-YYYY-MM.pdf` from calendar.

Tasks:
1. `npm i jspdf html2canvas`
2. `src/composables/useExportPdf.js` — implement per spec snippet
3. In `SummaryPage.vue`:
   - Wrap CalendarGrid in a div that has a known ref
   - Add a "Loading…" disabled state while exporting
4. Filename: `kidhealth-${year}-${pad(month)}.pdf`
5. Add small print header inside the calendar (title + month label) so the PDF is self-explanatory
6. **v1.3.0 Bug Fix:** ปรับ logic ใน `useExportPdf.js`:
   - ถ้าภาพที่ capture สูงเกินกว่าหน้า A4 portrait → scale proportionally เพื่อให้ทุกอย่างอยู่ในหน้าเดียว
   - ยกเลิก pagination loop (ไม่ต้องแบ่งหลายหน้า) — ใช้ `fit` หรือคำนวณ new width/height แทน
   - จัดกึ่งกลางภาพในแนวนอน

**Acceptance:**
- Click Export → PDF downloads
- PDF contains: month label, full calendar grid, legend, counts — **ทั้งหมดในหน้าเดียว**
- Image quality is sharp (`scale: 2`)
- Test on Chrome + Safari

---

### Phase 6 — UX Polish (M6)
**Goal:** Production-quality feel.

Tasks:
1. Toast system (lightweight): `src/composables/useToast.js` + `<ToastContainer/>` in App.vue
   - success / error / info variants
   - auto-dismiss 3s
2. Loading skeletons on Summary while fetching month
3. Empty states: "ยังไม่มีข้อมูลเดือนนี้" with friendly copy
4. Responsive:
   - Mobile-first
   - SymptomCard grid stacks to 1 column on `< sm`
   - Calendar shrinks gracefully; horizontal scroll fallback if needed
5. Accessibility:
   - All inputs have `<label>`
   - SymptomCards are `role="radio"` inside `role="radiogroup"`
   - Focus rings visible
6. Thai typography: use system Thai font stack; consider `Noto Sans Thai` via Google Fonts

**Acceptance:**
- Lighthouse a11y ≥ 90
- All flows work on iPhone Safari (375px width)

---

### Phase 7 — Profile Features (ชื่อลูก, วันเกิด, อายุอัตโนมัติ) (M7)
**Goal:** User can set first_name + last_name at register; edit child_name + child_birthday from Profile; age auto-calculates.

Tasks:
1. Create `profiles` table migration (id, first_name, last_name, child_name, child_birthday, created_at, updated_at) + RLS + trigger
2. Add `first_name` + `last_name` fields to `RegisterPage.vue`, pass via `options.data` in signUp
3. Create `src/stores/profile.js` (Pinia):
   - state: `profile` object
   - actions: `fetchProfile()`, `upsertProfile()`, `createProfileFromMetadata()`
4. Update `src/pages/ProfilePage.vue`:
   - Load profile from DB on mount
   - Show first_name + last_name in gradient header
   - Editable input for child_name
   - Date input for child_birthday
   - Auto-calculate age (years/months/days) from child_birthday
   - Save button to persist changes
5. Auto-create profile from `user_metadata` on first login if not exists
6. Auth store: expose `user_metadata` (first_name, last_name) for fallback display

**Acceptance:**
- Register page shows first_name + last_name fields
- After confirm + first login, profile record is auto-created
- Profile page shows full name and email in header
- Can edit child_name and child_birthday → save persists
- Age displayed correctly: "2 ปี 3 เดือน" / "8 เดือน" / "15 วัน"
- Reload page → saved values persist

---

### Phase 7b — Avatar Upload (M7b, v1.4.0)

> **Known Issues (v1.4.3):** 
> - **Cache-busting:** ต้องเติม `?t={timestamp}` ต่อ public URL เพื่อป้องกัน browser cache รูปเก่า
> - **iOS HEIC support:** รูปจากกล้อง iPhone เป็น HEIC (.heic) → เพิ่ม MIME type ใน `accept` + แปลง HEIC→JPEG ด้วย `heic2any` ก่อน upload
**Goal:** User can upload profile picture (avatar) and see it on Header + Profile page.

Tasks:
1. **Database:** Add `avatar_url text` column to `profiles` table (nullable)
2. **Supabase Storage:** สร้าง bucket `avatars` (public) + RLS policies สำหรับ CRUD ของ user ตัวเอง
3. **Profile Store (`src/stores/profile.js`):**
   - Add action `async uploadAvatar(file)` — อัปโหลดไฟล์ไปที่ `storage/avatars/{user_id}/{timestamp}.{ext}`
   - Add action `async deleteAvatar()` — ลบรูปเก่า (ถ้ามี) แล้ว set `profiles.avatar_url = null`
   - แก้ `fetchProfile()` และ `updateProfile()` ให้รองรับ `avatar_url`
4. **Profile Page (`src/pages/ProfilePage.vue`):**
   - Avatar section: แสดงรูปที่ upload (หรือ fallback emoji)
   - ปุ่ม/overlay "เปลี่ยนรูปโปรไฟล์" → `<input type="file" accept="image/jpeg,image/png">`
   - Validate ขนาด ≤ 2MB
   - Crop รูปเป็น 1:1 (ใช้ canvas) ก่อน upload หรือใช้ CSS `object-fit: cover`
   - Upload แล้วอัปเดต `avatar_url` ทันที + แสดง preview
   - Delete avatar option (optional: explicit delete button)
5. **Dashboard Header (`src/pages/DashboardPage.vue`):**
   - Avatar link (`<router-link to="/profile" class="avatar">`) แสดง `<img>` ถ้ามี `avatar_url` หรือ fallback emoji
6. **Styling:**
   - Avatar image: `width: 44px; height: 44px; border-radius: 50%; object-fit: cover;`
   - Profile card avatar: ขนาดใหญ่ขึ้น ~80px, `object-fit: cover`
   - Upload overlay/hover state

**Acceptance:**
- User can upload JPG/PNG ≤ 2MB from Profile page
- Uploaded avatar shows immediately on Profile card header
- Header Dashboard shows uploaded avatar (replaces emoji icon)
- Reload page → avatar persists
- Can upload new avatar (replaces old)
- Error shown if file too large or wrong type
- Supabase Storage bucket `avatars` has RLS policies working

### Phase 7c — Guest Mode (M17, v2.0.0)

**Goal:** ให้ผู้ใช้ทดลองใช้งานแอพได้ทันทีโดยไม่ต้องสมัครสมาชิก ข้อมูลถูกเก็บใน localStorage และสามารถย้ายไปยัง Supabase ได้เมื่อสมัครทีหลัง

**Est:** 2.0 days

#### Architecture

Guest Mode แบ่งเป็น 3 ส่วนหลัก:
1. **Auth Layer** — เพิ่ม `isGuest` state + `enterGuestMode()` / `exitGuestMode()` / `migrateGuestData()`
2. **Data Layer** — Logs Store รองรับ localStorage backend เมื่อ `isGuest=true`
3. **UI Layer** — Guest banner, ปุ่ม Guest Mode ที่ Login, Profile upgrade prompt

```
┌─────────────────────────────────────────────────┐
│                  LoginPage                       │
│  ┌─────────────────────────────────────────┐    │
│  │         Email + Password form            │    │
│  ├─────────────────────────────────────────┤    │
│  │         ─── หรือ ───                     │    │
│  │  [🚀 ทดลองใช้งาน] ← NEW                  │    │
│  └─────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────┘
                       │ คลิก "ทดลองใช้งาน"
                       ▼
┌─────────────────────────────────────────────────┐
│              Auth Store                          │
│  isGuest = true                                  │
│  guestId = crypto.randomUUID()                   │
│  save guest_id → localStorage                    │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│           Dashboard / Summary / Profile          │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │
│  │ 🔒 คุณกำลังใช้โหมดทดลอง                  │    │
│  │ ข้อมูลถูกบันทึกในเครื่องนี้เท่านั้น          │    │
│  │ [สมัครสมาชิกเพื่อบันทึกถาวร]               │    │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Symptom Cards → บันทึก → localStorage    │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

#### Tasks

**M17.1 — Auth Store: Guest state & actions**
- เพิ่ม `state: isGuest (bool), guestId (string|null)`
- เพิ่ม `action enterGuestMode()`:
  - ตรวจสอบ `localStorage` ว่ามี `guest_id` หรือไม่ → ถ้าไม่มี สร้างใหม่ด้วย `crypto.randomUUID()`
  - set `isGuest = true`, `guestId = guid`
  - เรียก `logs.setGuestMode(true)`
- เพิ่ม `action exitGuestMode()`: clear guest state, เรียก `logs.setGuestMode(false)`
- เพิ่ม `action migrateGuestData()`:
  - อ่าน guest logs จาก localStorage → upsert ทีละ record ไปยัง `daily_logs` ด้วย `auth.user.id`
  - ลบ guest data หลังจาก migrate สำเร็จ
  - คืนค่า `{ migratedCount, errors }`
- init: ถ้า `!session` → `isGuest = false` (default, ให้ user เลือกเองจาก Login)

**Files:** `src/stores/auth.js`

**M17.2 — Router: อนุญาต Guest เข้าถึง protected routes**
- แก้ `router.beforeEach`:
  ```js
  if (to.meta.requiresAuth && !auth.session && !auth.isGuest) return '/login'
  ```
- ไม่ต้องเพิ่ม `meta.guestAllowed` — ใช้ `isGuest` ครอบคลุมทุก protected route

**Files:** `src/router/index.js`

**M17.3 — Logs Store: localStorage backend เมื่อ isGuest**
- เพิ่ม helper functions:
  - `getGuestLogs()` → `{ guestId, logs }`
  - `saveGuestLogs(logs)`
- แก้ `fetchForDate()`: ถ้า `isGuest` → อ่านจาก localStorage แทน Supabase
- แก้ `fetchMonth()`: ถ้า `isGuest` → filter เฉพาะเดือนจาก localStorage
- แก้ `upsertLog()`: ถ้า `isGuest` → upsert ไป localStorage, validate future-date เหมือนเดิม

**Business Rules (Guest):**
- Date format: ISO `YYYY-MM-DD` (เหมือน Supabase)
- Future date validation: ใช้ rule เดียวกับ registered user
- Guest data structure ใน localStorage:
  ```json
  {
    "guestLogs": {
      "<guestId>": {
        "2026-06-28": "NORMAL",
        "2026-06-29": "FEVER"
      }
    }
  }
  ```

**Files:** `src/stores/logs.js`

**M17.4 — LoginPage: เพิ่มปุ่ม "ทดลองใช้งาน"**
- เพิ่ม `<hr>` divider
- เพิ่มปุ่ม `"🚀 ทดลองใช้งาน"` (style `btn--ghost`)
- `@click` → `auth.enterGuestMode()` → `router.push('/dashboard')`
- เพิ่มข้อความใต้ปุ่ม: `"ไม่ต้องสมัครสมาชิก ข้อมูลถูกบันทึกในเครื่อง"`
- ป้องกันการ submit form เมื่อกด Guest (type="button")

**Files:** `src/pages/LoginPage.vue`, `src/styles/components/button.css` (เพิ่ม `.btn--ghost`)

**M17.5 — Guest Banner Component**
- สร้าง `src/components/GuestBanner.vue`:
  ```html
  <template>
    <div v-if="auth.isGuest" class="guest-banner" role="alert">
      <div class="guest-banner__content">
        <span class="guest-banner__icon">🔒</span>
        <div class="guest-banner__text">
          <strong>โหมดทดลอง</strong>
          <span>ข้อมูลถูกบันทึกในเครื่องนี้เท่านั้น</span>
        </div>
        <router-link to="/register" class="guest-banner__cta">สมัครเพื่อบันทึกถาวร</router-link>
      </div>
    </div>
  </template>
  ```
- Style: แถบสีเหลืองอ่อน (`bg-amber-50`, `border-amber-200`), responsive
- แสดงใน DashboardPage, SummaryPage, ProfilePage (วางไว้ใต้ page-header, ก่อน content หลัก)

**Note:** จริงๆ การสร้าง Component ใหม่ต้องถามก่อนตาม AGENTS.md ("ไม่เพิ่ม dependency ใหม่ โดยไม่ถามก่อน") แต่ Component เป็นส่วนหนึ่งของโครงสร้างที่มีอยู่แล้ว (components/ มีอยู่แล้ว) — ถือว่าเป็น component ใหม่ในโปรเจกต์.

**Files:** `src/components/GuestBanner.vue`, `src/pages/DashboardPage.vue`, `src/pages/SummaryPage.vue`, `src/pages/ProfilePage.vue`

**M17.6 — DashboardPage: Guest mode adaptation**
- greeting: ถ้า `isGuest` → `"สวัสดี ผู้ใช้ทดลอง 👋"`
- avatar link: ถ้า `isGuest` → ซ่อนหรือแสดง icon ดีฟอลต์
- เพิ่ม `<GuestBanner />` ใน template
- หลังบันทึก: toast ต่างกันเล็กน้อย `"บันทึกอาการแล้ว (บันทึกในเครื่อง)"`

**Files:** `src/pages/DashboardPage.vue`

**M17.7 — ProfilePage: Guest mode → upgrade prompt**
- ถ้า `isGuest`:
  - ซ่อน profile card (avatar, name, email, child info fields)
  - ซ่อนปุ่ม Logout
  - แสดง "Upgrade Card" แทน:
    - Icon 🔒
    - "บันทึกข้อมูลของคุณให้ถาวร"
    - จำนวนวันที่บันทึก (จาก localStorage)
    - ปุ่ม "สมัครสมาชิก (คงข้อมูลเดิม)" → `/register`
    - ปุ่ม "เข้าสู่ระบบ (ถ้ามีบัญชีอยู่แล้ว)" → `/login`
- Scroll ไปที่ upgrade card อัตโนมัติ

**Files:** `src/pages/ProfilePage.vue`

**M17.8 — SummaryPage: Guest mode adaptation**
- ใช้ localStorage data แทน Supabase fetch (ผ่าน logs store ที่ถูกแก้แล้ว)
- เพิ่ม `<GuestBanner />`
- Export PDF ใช้ได้เหมือนเดิม (ไม่พึ่ง auth)

**Files:** `src/pages/SummaryPage.vue`

**M17.9 — Data Migration Flow (Guest → Registered)**
- trigger: `auth.onAuthStateChange` → detect session change → ถ้าก่อนหน้านี้ `isGuest` → เรียก `migrateGuestData()`
- ขั้นตอน:
  1. `auth.onAuthStateChange` fires with new session
  2. ตรวจสอบ `localStorage` ว่ามี `guestLogs` + `guest_id` หรือไม่
  3. ถ้ามี → `logs.setGuestMode(true)` → อ่าน guest logs → upsert ทั้งหมด → `exitGuestMode()` → ลบ localStorage
  4. Toast แสดงจำนวน record ที่ migrate
  5. ถ้า migrate ล้มเหลวบาง record → log error + continue
- **Safe rollback:** guest data จะถูกลบหลังจาก upsert สำเร็จทุก record เท่านั้น
- **Prevent double migrate:** ตรวจสอบ `guestLogs` ก่อน migrate; ถ้าไม่มี → ข้าม

**Files:** `src/stores/auth.js`

**M17.10 — Guest Warning Toast ตอนเข้า Guest Mode**
- ใน `auth.enterGuestMode()`: เรียก toast `info`:
  ```js
  info('🔒 ข้อมูลจะถูกบันทึกในเครื่องนี้เท่านั้น หากล้างข้อมูลใน browser จะสูญหาย')
  ```
- ป้องกันไม่ให้ toast ซ้ำ (เช็คว่าเพิ่งเข้า Guest Mode หรือไม่)

**Files:** `src/stores/auth.js` (import useToast)

---

#### Acceptance Criteria

1. User กด "ทดลองใช้งาน" → เข้า Dashboard ได้ทันที, ไม่ต้องกรอกข้อมูล
2. บันทึกอาการใน Guest Mode → ข้อมูลอยู่ใน localStorage
3. ปิดแอพ → เปิดใหม่ (ไม่ clear data) → ข้อมูลเดิมยังอยู่
4. หน้า Profile ใน Guest → แสดง upgrade prompt + จำนวนวันที่บันทึก
5. Guest → สมัครสมาชิก → ยืนยัน email → login → ข้อมูลถูก migrate ไป Supabase
6. หลัง migrate → localStorage ถูกลบ → ใช้ต่อเป็น registered user ปกติ
7. Guest → Login (มีบัญชี) → ไม่ migrate (ไม่มี guest data)
8. Guest Banner แสดงในทุก protected page
9. localStorage quota ไม่เกิน (ทดสอบกับข้อมูล 100+ records)
10. Export PDF ยังใช้ได้ใน Guest Mode
11. iOS Safari/PWA: Guest Mode ยังทำงาน (localStorage มีใน PWA)

---

### Phase 7d — UI Redesign — Profile page (M18, v3.0.0)

**Goal:** ปรับโฉมหน้า Profile page ตาม mockup ใหม่ — child info card แบบ table layout, stats cards, gender pill toggle, logout button แบบ danger outlined

**Est:** 1.0 day

#### Architecture Changes

```
┌────────────────────────────────────┐
│ gradient: 135deg #0EA5E9 → #6366F1 │  ← profile card header (เดิมอยู่แล้ว)
│  ┌──┐   คุณแม่มนัสนันท์            │      เพิ่ม avatar edit overlay
│  │👩│   manat@email.com            │
│  │✏️│                              │
│  └──┘                              │
└────────────────────────────────────┘

┌─── ข้อมูลลูก ──────────────────────┐  ← card (ใหม่: table layout)
│ 👶 ชื่อเล่น     [input]           │  ← label เปลี่ยนจาก "ชื่อลูก" → "ชื่อเล่น"
│ 🎂 วันเกิด      [date input]      │  ← แสดงอายุใต้ input
│ ⚤ เพศ          [👧/👦 pill]      │  ← gender toggle → pill design
└────────────────────────────────────┘

┌─── สถิติ ──────────────────────────┐  ← NEW: 2-column stats cards
│  📊 บันทึกเดือนนี้ 45 วัน          │
│  🔥 ติดต่อกัน 12 วัน 🎉           │
└────────────────────────────────────┘

[ บันทึก ]   ← primary (#0EA5E9) — คงเดิม

[ ออกจากระบบ ]   ← changed: solid danger → danger outlined (bg #fff, border #FCA5A5, text #EF4444)
```

#### Tasks

**M18.1 — ProfilePage template update:**
- ปรับ child info section จาก input list → table layout card (icon + label | input)
- เปลี่ยน label "ชื่อลูก" → "ชื่อเล่น"
- ย้าย age display ไปอยู่ใต้ birthday input (text #0EA5E9/11px)
- ปรับ gender selector เป็น pill toggle (selected: bg #EFF6FF, border #93C5FD, text #0284C7)
- เพิ่ม stats section 2-column (ซ้าย: "บันทึกเดือนนี้", ขวา: "ติดต่อกัน")
- ปรับ logout button → danger outlined (bg #fff, border #FCA5A5, text #EF4444)

**Files:** `src/pages/ProfilePage.vue`

**M18.2 — ProfilePage style updates:**
- Gender pill toggle styles (selected/unselected)
- Stats card styles (green tint bg, blue tint bg)
- Danger outlined button styles (ถ้ายังไม่มีใน button.css)
- Child info card table layout spacing

**Files:** `src/styles/components/button.css`, `src/pages/ProfilePage.vue`

**M18.3 — Streak calculation (ติดต่อกัน):**
- Compute number of consecutive log days going backward from today
- Reset count when a day is missing
- รวมใน profile store หรือ compute ใน component

**Files:** `src/stores/logs.js` หรือ `src/pages/ProfilePage.vue`

**M18.4 — Update design doc:**
- อัปเดต `.docs/design.md` section 8.4 และ 6.3 (logout variant) ตาม mockup ใหม่

**Files:** `.docs/design.md`

**M18.5 — Bump version to 3.0.0:**
- `package.json` version → `3.0.0`
- Commit พร้อม tag `v3.0.0`

**Files:** `package.json`

#### Files Modified

| File | Change |
|------|--------|
| `src/pages/ProfilePage.vue` | Child info card, stats section, gender pill, logout style |
| `src/styles/components/button.css` | Danger outlined variant (ถ้ายังไม่มี) |
| `src/stores/logs.js` | Streak calculation helper |
| `.docs/design.md` | Sync section 8.4, 6.3 with mockup |
| `package.json` | Bump version → 3.0.0 |

#### Acceptance Criteria

1. Profile page child info แสดงเป็น card มี 3 แถว: ชื่อเล่น, วันเกิด (พร้อมอายุ), เพศ (pill)
2. Gender pill: selected state มี bg #EFF6FF, border #93C5FD, text #0284C7
3. Stats cards: ซ้าย "บันทึกเดือนนี้" (bg #F0FDF4), ขวา "ติดต่อกัน" (bg #EFF6FF)
4. Logout button: white bg, red border (#FCA5A5), red text (#EF4444)
5. Age format: "X ปี Y เดือน" / "X เดือน" / "X วัน"
6. Streak calculation ถูกต้อง (นับย้อนหลังจากวันนี้, ขาด→reset)
7. Child info card มี border-subtle + shadow-subtle ตาม card pattern
8. Profile card header gradient ยังเหมือนเดิม (#0EA5E9 → #6366F1)

---

### Phase 7e — Dark Mode (M19, v4.0.0)

**Goal:** ให้แอพรองรับ Dark Mode โดยผู้ใช้สามารถเลือกเองได้ (manual toggle) และตรวจจับค่าเริ่มต้นจากระบบปฏิบัติการ

**Est:** 1.0 day

#### Tasks

**M19.1 — Create `useDarkMode.js` composable:**
- สร้าง `src/composables/useDarkMode.js`
- จัดการ `.dark` class บน `<html>` element
- ตรวจจับ `prefers-color-scheme: dark` (system preference)
- บันทึก/อ่านค่า preference จาก localStorage (key: `kidhealth-dark-mode`)
- ให้ความสำคัญกับ manual toggle > system preference
- อัปเดต `<meta name="theme-color">` ตาม mode

**Files:** `src/composables/useDarkMode.js`

**M19.2 — Tailwind v4 dark mode config:**
- เพิ่ม `@custom-variant dark (&:where(.dark, .dark *));` ใน `style.css`
- เพิ่ม dark mode CSS custom properties override ใน `tokens.css`
- แก้ไข `index.html`: เพิ่ม `<meta name="color-scheme" content="light dark">`

**Files:** `src/style.css`, `src/styles/tokens.css`, `index.html`

**M19.3 — Update all components with `dark:` variants:**
- ใช้ `dark:` utility class ในทุก component template:
  - Background (`bg-white` → `dark:bg-slate-800`)
  - Text (`text-slate-700` → `dark:text-slate-200`)
  - Border (`border-slate-200` → `dark:border-slate-700`)
- Input, button, card, nav, calendar, toast, legend, symptom card
- Symptom colors: **คงเดิม** (ไม่เปลี่ยน)
- Calendar no-data cell: `bg-[#F1F5F9]` → `dark:bg-[#334155]`
- Toast: กลับสี (`bg-slate-900 text-white` → `dark:bg-white dark:text-slate-900`)
- Guest Banner: `bg-amber-50` → `dark:bg-amber-900/30`
- Today outline: `ring-sky-500` → `dark:ring-sky-400`

**Files:** `src/pages/*.vue`, `src/components/*.vue`, `src/styles/components/*.css`

**M19.4 — Dark Mode Toggle UI:**
- เพิ่ม toggle switch ใน ProfilePage (ใต้ stats section)
- `role="switch"`, `aria-checked` ตาม accessibility
- Label: "🌙 โหมดมืด"
- style: custom toggle switch

**Files:** `src/pages/ProfilePage.vue`

**M19.5 — Export PDF Dark Mode Compatibility:**
- แก้ `useExportPdf.js` — บังคับ light mode ก่อน capture แล้ว restore หลัง export
- ป้องกัน PDF มีพื้นหลังสีดำ

**Files:** `src/composables/useExportPdf.js`

**M19.6 — PWA theme-color:**
- อัปเดต `<meta name="theme-color">` ตาม mode
- light: `#F8FAFC`, dark: `#0F172A`

**Files:** `src/composables/useDarkMode.js`

#### Files Modified

| File | Change |
|------|--------|
| `src/composables/useDarkMode.js` | **New** |
| `src/composables/useExportPdf.js` | dark→light override |
| `src/style.css` | `@custom-variant dark` |
| `src/styles/tokens.css` | Dark mode CSS properties |
| `src/styles/components/*.css` | Dark mode variants |
| `src/pages/ProfilePage.vue` | Dark mode toggle |
| `src/pages/*.vue` | `dark:` classes |
| `src/components/*.vue` | `dark:` classes |
| `index.html` | `color-scheme` meta |

#### Acceptance Criteria

1. เปิดแอพในระบบ Dark Mode → `.dark` class ถูกเพิ่มอัตโนมัติ
2. กด toggle "โหมดมืด" → class สลับ → localStorage บันทึกค่า
3. Refresh หน้า → ค่า preference ยังคงเดิม
4. Clear localStorage → กลับไปใช้ system preference
5. Symptom colors ไม่เปลี่ยนแปลงใน Dark Mode
6. ทุก component แสดงถูกต้องใน Dark Mode
7. Calendar no-data cell เปลี่ยนเป็น `#334155`
8. Export PDF ออกมาเป็น light mode เสมอ
9. PWA theme-color เปลี่ยนตาม mode
10. iOS Safari/PWA: dark mode ทำงาน

---

### Phase 7f — Forgot Password (M20, v4.0.0)

**Goal:** ให้ผู้ใช้สามารถรีเซ็ตรหัสผ่านด้วยตนเองผ่านหน้า UI

**Est:** 0.5 day

#### Tasks

**M20.1 — Auth Store: recovery state & actions:**
- เพิ่ม `state.isPasswordRecovery` (bool, default false)
- เพิ่ม `action resetPassword(email)` → `supabase.auth.resetPasswordForEmail()`
- เพิ่ม `action updatePassword(password)` → `supabase.auth.updateUser()`
- อัปเดต `onAuthStateChange`: ตรวจจับ `PASSWORD_RECOVERY` event
- reset `isPasswordRecovery` เมื่อ `SIGNED_OUT`

**Files:** `src/stores/auth.js`

**M20.2 — Create ForgotPasswordPage:**
- หน้า `/forgot-password` — กรอก email
- onSubmit → `auth.resetPassword(email)` → success state
- Security: ไม่บอกว่า email มีอยู่จริงหรือไม่
- Link "กลับไปหน้า Login"
- Loading state, error toast
- ถ้ามี session → redirect `/dashboard`

**Files:** `src/pages/ForgotPasswordPage.vue`

**M20.3 — Create ResetPasswordPage:**
- หน้า `/reset-password` — ตั้งรหัสผ่านใหม่
- ตรวจจับ recovery session (PASSWORD_RECOVERY event)
- ถ้าไม่มี recovery session → redirect `/forgot-password` + error toast
- form: password ใหม่ + ยืนยัน, validate length ≥ 8
- onSubmit → `auth.updatePassword(password)` → success toast → redirect `/login`
- ถ้ามี session ปกติ → redirect `/dashboard`

**Files:** `src/pages/ResetPasswordPage.vue`

**M20.4 — Router: เพิ่ม routes + guard:**
- Routes: `/forgot-password`, `/reset-password`
- Guard: `if (/forgot-password && session) redirect /dashboard`
- ResetPasswordPage: guard ปล่อยผ่าน — ตรวจสอบ recovery ใน component

**Files:** `src/router/index.js`

**M20.5 — Supabase Configuration:**
- ตั้งค่า Redirect URLs ใน Supabase Dashboard: เพิ่ม `${origin}/reset-password`
- ตรวจสอบ email template "Reset Password"
- ตรวจสอบว่า "Confirm email" เปิดอยู่

**Files:** (Supabase Dashboard — ไม่มี code change)

#### Files Modified

| File | Change |
|------|--------|
| `src/pages/ForgotPasswordPage.vue` | **New** |
| `src/pages/ResetPasswordPage.vue` | **New** |
| `src/router/index.js` | 2 routes + guard |
| `src/stores/auth.js` | `isPasswordRecovery`, `resetPassword()`, `updatePassword()` |

#### Acceptance Criteria

1. Login page มี link "ลืมรหัสผ่าน?"
2. คลิก → ไป `/forgot-password`
3. กรอก email → success message แสดง
4. อีเมลที่ลงทะเบียนได้รับ link reset จริง
5. คลิก link → ไป `/reset-password#access_token=...`
6. แสดง form ตั้งรหัสผ่านใหม่
7. กรอกรหัสผ่านใหม่ + ยืนยัน → success toast → redirect `/login`
8. Login ด้วยรหัสผ่านใหม่ → เข้าระบบได้
9. Login ด้วยรหัสผ่านเก่า → error
10. recovery link หมดอายุ → redirect `/forgot-password` + error toast
11. มี session อยู่แล้วที่ `/forgot-password` → redirect `/dashboard`
12. ไม่บอก user ว่า email มีในระบบหรือไม่

---

### Phase 8 — Deploy to Vercel (M8)
**Goal:** Production deploy with separate dev preview.

Tasks:
1. Push to GitHub (private repo)
2. Import project in Vercel
3. Set Environment Variables per spec table (Production = prod project, Preview = dev project)
4. Configure Production branch = `main`
5. Test:
   - Production URL → uses prod Supabase
   - Open PR → Preview URL → uses dev Supabase
6. Add `vercel.json` if needed (none required for SPA if rewrites are configured — Vercel auto-detects Vite)
7. Add custom domain (optional)

**Acceptance:**
- `vercel --prod` deploys to production env
- Vercel logs show correct `VITE_APP_ENV=production`
- New registration on production creates user in prod Supabase

---

### Phase 9 — QA / UAT (M9)
**Goal:** Validate all flows and Out-of-Scope items are correctly absent.

#### 9.1 Test Matrix

| # | Scenario | Expected | Status |
|---|---|---|---|---|
| 1 | Register new user, confirm email | Redirects to dashboard | ☐ |
| 2 | Login wrong password | Error message shown | ☐ |
| 3 | Login correct | Redirects to dashboard | ☐ |
| 4 | Save symptom first time | Toast "บันทึกแล้ว ✓" | ☐ |
| 5 | Reopen same date | Pre-selected | ☐ |
| 6 | Change saved value | Upsert works (1 row total) | ☐ |
| 7 | Pick future date | Blocked + error toast | ☐ |
| 8 | Switch month in Summary | Loads new data | ☐ |
| 9 | Counts add up | sum = days with logs | ☐ |
| 10 | Export PDF | File downloads, layout intact | ☐ |
| 11 | Logout | Session cleared, redirect to /login | ☐ |
| 12 | RLS: another user tries to query your rows | Returns 0 rows | ☐ |
| 13 | Mobile (375px) | All flows usable | ☐ |
| 14 | Register with first_name + last_name → profile auto-created | Profile shows name | ☐ |
| 15 | Edit child_name + child_birthday → save → reload | Values persist | ☐ |
| 16 | Age auto-calculated correctly from child_birthday | Shows "X ปี Y เดือน Z วัน" | ☐ |
| 17 | Select child gender (male/female) | Dashboard header shows correct emoji | ☐ |
| 18 | PDF export — content fits in 1 page (no page 2) | PDF shows all data on single page | ☐ |
| 19 | PDF export on iOS PWA (A2HS) | Content not cropped, multi-page if needed | ☐ |
| 20 | Upload avatar from Profile page (JPG ≤ 700KB) | Avatar shows in preview + saves | ☐ |
| 21 | Dashboard header shows uploaded avatar | Avatar replaces emoji icon | ☐ |
| 22 | Upload PNG avatar | Works same as JPG | ☐ |
| 23 | Upload avatar > 700KB → auto-compress | Image compressed and upload succeeds | ☐ |
| 24 | Upload file non-image (.pdf) → error | File picker limits to images | ☐ |
| 25 | Reload page after avatar upload | Avatar persists (profiles.avatar_url) | ☐ |
| 26 | Upload new avatar → old one overwritten | Path `{userId}/avatar` fixed, upsert works | ☐ |
| 27 | Avatar cache-busting: re-upload → new image shows | `?t={timestamp}` bypasses browser cache | ☐ |
| 28 | iOS HEIC photo → upload from album → converts to JPEG | File picker accepts HEIC, conversion works | ☐ |
| 29 | Summary: Counts match calendar color cells | Counted values match visible cells | ☐ |
| 30 | PWA: Chrome DevTools manifest valid | Manifest + SW registered | ☐ |
| 31 | PWA: iOS Add to Home Screen shows icon | apple-touch-icon PNG shows correctly | ☐ |

#### 9.2 Supabase Verification
- RLS test: `profiles` — user can only see own profile
- Check `auth.users` has 2 test accounts

#### 9.3 Browser Matrix
- Chrome (desktop) ✓
- Safari (macOS) ✓
- Safari iOS ✓
- Chrome Android (optional)

---

## 2. File-Level Implementation Map

```
KidHealthTracker/
├── .env.development          # dev Supabase keys (committed)
├── .env.production           # prod keys (gitignored)
├── .env.local                # local override (gitignored)
├── .gitignore
├── index.html                # PWA meta tags + Sarabun font + manifest
├── package.json
├── vite.config.js            # Vue + Tailwind v4 + VitePWA plugins, @ alias
├── vercel.json               # SPA fallback rewrites
├── public/
│   ├── favicon-v2.svg
│   ├── pwa-icon-v2.svg
│   ├── pwa-icon-{180,152,192,512}.png
│   └── ...
└── src/
    ├── main.js               # bootstrap: Pinia → auth.init() → router → mount
    ├── App.vue               # loading splash + router-view + BottomNav + ToastContainer
    ├── style.css             # @import all CSS + tailwindcss
    ├── assets/
    ├── lib/
    │   └── supabase.js       # createClient from env vars
    ├── router/
    │   └── index.js          # 8 routes + auth guard beforeEach
    ├── stores/
    │   ├── auth.js           # session, user, loading, init/signIn/signUp/signOut
    │   ├── logs.js           # fetchForDate, fetchMonth, upsertLog
    │   └── profile.js        # fetch, update, uploadAvatar
    ├── pages/
│   ├── LoginPage.vue
│   ├── RegisterPage.vue  # first_name + last_name fields
│   ├── VerifyEmailPage.vue
│   ├── ForgotPasswordPage.vue  # forgot password form (v4.0.0)
│   ├── ResetPasswordPage.vue   # set new password form (v4.0.0)
│   ├── DashboardPage.vue # date picker, 6 symptom cards, avatar header
│   ├── SummaryPage.vue   # month picker, calendar, legend, export PDF
│   └── ProfilePage.vue   # profile card, avatar upload, child info, gender, age
    ├── components/
    │   ├── BottomNav.vue     # 3-tab bottom navigation
    │   ├── CalendarGrid.vue  # 7-col color-coded calendar
    │   ├── Legend.vue        # symptom legend + day counts
    │   ├── MonthPicker.vue   # ← month year → navigation
    │   ├── SymptomCard.vue   # colored radio card with emoji
    │   └── ToastContainer.vue
    ├── composables/
    │   ├── useDarkMode.js    # dark mode toggle + system preference detection (v4.0.0)
    │   ├── useExportPdf.js   # html2canvas + jsPDF (iOS full capture + multi-page)
    │   └── useToast.js       # global toast state
    ├── constants/
    │   └── symptoms.js       # 6 symptoms with code, label, emoji, color, tint, border
    └── styles/
        ├── tokens.css
        ├── typography.css
        ├── base.css
        └── components/
            ├── button.css
            ├── input.css
            ├── symptom-card.css
            ├── calendar.css
            ├── bottom-nav.css
            └── toast.css
```

---

## 3. Key Code Skeletons

### 3.1 `src/lib/supabase.js`
```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: true, autoRefreshToken: true } }
)
```

### 3.2 `src/stores/auth.js` (skeleton)
```js
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({ session: null, user: null, loading: true }),
  actions: {
    async init() {
      const { data } = await supabase.auth.getSession()
      this.session = data.session
      this.user = data.session?.user ?? null
      this.loading = false
      supabase.auth.onAuthStateChange((_e, session) => {
        this.session = session
        this.user = session?.user ?? null
      })
    },
    async signIn(email, password) {
      return supabase.auth.signInWithPassword({ email, password })
    },
    async signUp(email, password) {
      return supabase.auth.signUp({ email, password })
    },
    async signOut() {
      return supabase.auth.signOut()
    },
  },
})
```

### 3.3 `src/router/index.js` (guard)
```js
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (auth.loading) return  // wait for init
  if (to.meta.requiresAuth && !auth.session) return '/login'
  if ((to.path === '/login' || to.path === '/register') && auth.session) return '/dashboard'
})
```

### 3.4 `src/stores/profile.js` (skeleton)
```js
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
    loading: false,
  }),
  actions: {
    async fetchProfile() {
      const auth = useAuthStore()
      if (!auth.user) return null
      this.loading = true
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', auth.user.id)
        .maybeSingle()
      if (!data) {
        // create from user_metadata if not exist
        const meta = auth.user.user_metadata || {}
        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert({
            id: auth.user.id,
            first_name: meta.first_name || '',
            last_name: meta.last_name || '',
            child_name: '',
            child_birthday: null,
            child_gender: null,
          })
          .select()
          .single()
        this.profile = newProfile
      } else {
        this.profile = data
      }
      this.loading = false
      return this.profile
    },
    async updateProfile(updates) {
      const auth = useAuthStore()
      if (!auth.user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: auth.user.id, ...updates })
        .select()
        .single()
      if (error) throw error
      this.profile = data
      return data
    },
  },
})
```

### 3.5 Upsert call
```js
await supabase
  .from('daily_logs')
  .upsert(
    { user_id: user.id, log_date: date, symptom: code },
    { onConflict: 'user_id,log_date' }
  )
```

---

## 4. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Forgot to enable email confirmation in Supabase | Users log in without verifying | Documented in M1; verified by UAT #1 |
| `VITE_*` vars baked at build time | Switching env requires rebuild | Document in README; rely on Vercel env per branch |
| `html2canvas` not capturing CSS Grid well | PDF looks broken | Use `scale: 2`, ensure grid is fully visible, fallback to `background-color` instead of gradients |
| Thai font missing in PDF | Squares instead of text | Use system fonts or embed via html2canvas (it captures computed styles) |
| RLS mis-configured | Data leak | Test with second user in M8 |
| RLS `using` vs `with check` confusion | Insert blocked for own user | Use both: `USING` for select/update/delete, `WITH CHECK` for insert/update |
| Vercel free tier Supabase pause | Dev/test data lost | Acceptable for v1; document |
| Race: `getSession()` resolves after first route render | Brief redirect glitch | Await `auth.init()` in `main.js` before `app.mount` |
| Avatar upload file too large | Upload failure, bad UX | Validate ≤ 2MB client-side before upload |
| Supabase Storage RLS misconfigured | Users can't upload/see avatars | Test CRUD policies with service_role key |
| `html2canvas` clip content at page boundary (desktop) | PDF content cut off | Use `fit` scaling to keep all content in 1 page (M11/v1.3.0) |
| `html2canvas` on iOS PWA captures only visible viewport | PDF content missing bottom rows (CalendarGrid + Legend) | Pass `height/width/windowHeight/windowWidth` scroll dimensions to html2canvas; add multi-page slicing fallback (M16/v1.4.4) |
| Avatar image distortion | Bad visual | Use `object-fit: cover` + 1:1 crop at client |
| Browser cache after avatar re-upload | Old avatar still shown | Add `?t=${Date.now()}` cache-busting param to public URL |
| iOS HEIC photos not selectable in file picker | Users can't upload photos from iOS album | Add `image/heic,image/heif` to `accept` + convert HEIC→JPEG client-side |
| Guest localStorage ถูกล้าง | Guest data สูญหาย | แจ้ง warning ตอนเข้า Guest Mode; recommend สมัครสมาชิก |
| Guest migrate ซ้ำ | Duplicate rows | upsert with `onConflict` ป้องกัน duplicate |
| Guest ใช้ Safari Private Mode (localStorage ปิด) | Guest mode ใช้ไม่ได้ | ตรวจจับ localStorage availability; แสดงข้อความ error |
| iOS PWA localStorage quota (5MB) | Guest data เยอะ → Full | ~100 bytes/record → 50,000 records ก็พอ |

---

## 5. Definition of Done (v1 Release)

- [ ] All 13 test matrix items pass
- [ ] No `console.error` in normal flows
- [ ] Lighthouse Performance ≥ 80, A11y ≥ 90
- [ ] Production URL works end-to-end
- [ ] Preview URL works with dev Supabase
- [ ] `README.md` documents setup, env, deploy
- [ ] Out-of-Scope items confirmed absent:
  - [ ] No multi-child profile
  - [ ] No push notification
  - [ ] No CSV export
- [ ] ~~No dark mode~~ ✅ มีแล้ว (v4.0.0)
- [ ] ~~No "forgot password" custom UI~~ ✅ มีแล้ว (v4.0.0)

---

## 6. Suggested Execution Order (Day-by-Day)

| Day | Tasks |
|---|---|---|---|
| 1 | M0 (bootstrap) + M1 (Supabase setup) |
| 2 | M2 (auth pages + store + guard) |
| 3 | M2 wrap-up + start M3 (dashboard UI) |
| 4 | M3 finish (upsert + edit mode) |
| 5 | M4 (calendar grid + month fetch) |
| 6 | M4 finish (legend + counts) |
| 7 | M5 (PDF export) |
| 8 | M6 (polish + toast + a11y) |
| 9 | M7 (Profile: profiles table, store, register fields, editable child info) |
| 10 | M8 (Bug fixes + PWA) |
| 11 | M9 (Vercel deploy) |
| 12 | M10 (QA/UAT) |
| — | **Post-Launch Sprints** |
| 13 | M10b (v1.2.0: RUNNY_GREEN, child_gender, greeting, T12:00 fix) |
| 14 | M11 (v1.3.0: PDF fit-to-page) |
| 15 | M12 (v1.4.0: Avatar upload) |
| 16 | M13–M14 (v1.4.1–1.4.2: Avatar bug fixes) |
| 17 | M15 (v1.4.3: Avatar cache-busting + HEIC) |
| 18 | M16 (v1.4.4: iOS PWA PDF multi-page slicing) |
| 19 | M17 (v2.0.0: Guest Mode — auth, localStorage, UI, migration) |
| 20 | M18 (v3.0.0: UI Redesign — Profile page, child info card, stats, danger outlined logout) |
| 21 | M19 (v4.0.0: Dark Mode — composable, CSS tokens, `dark:` variants, toggle) |
| 22 | M20 (v4.0.0: Forgot Password — 2 new pages, auth recovery, route guard) |

---

## 7. Open Questions to Confirm

1. **UI library:** Tailwind (lighter, faster) vs PrimeVue (more components out-of-box). Default: **Tailwind**.
2. **Email confirm message page:** keep simple text or design custom? Default: simple page that polls `onAuthStateChange`.
3. **Toast library:** roll your own vs `vue-toastification`. Default: **roll your own** (5-line composable).
4. **PDF page size:** A4 portrait per spec. Confirm if landscape ever needed (e.g., wide months). Default: **A4 portrait only for v1**.
5. **Date format display:** `DD/MM/YYYY` (Thai convention) vs ISO. Default: **DD/MM/YYYY (Buddhist year toggle optional)**.

---

## 8. Versioning Strategy (SemVer)

ใช้ **Semantic Versioning (SemVer)** — `MAJOR.MINOR.PATCH`

| ระดับ | รูปแบบ | เมื่อไรควรเพิ่ม |
|-------|--------|----------------|
| **MAJOR** | `X.0.0` | เปลี่ยนระบบใหญ่: เปลี่ยน data model ที่ DB, ย้าย Supabase project, redesign UI ใหม่ทั้งระบบ, เปลี่ยน auth flow, เปลี่ยนโครงสร้างหน้าเว็บครั้งใหญ่ |
| **MINOR** | `0.X.0` | เพิ่มฟีเจอร์ใหม่: เพิ่ม symptom ใหม่, เพิ่มหน้าใหม่ใน app, เพิ่ม export format ใหม่, เพิ่มภาษา, เปลี่ยนเว็บเป็นธีมสีใหม่ |
| **PATCH** | `0.0.X` | แก้บั๊ก: แก้ redirect ผิด, แก้ UI เล็กน้อย, ปรับ wording, ปรับ padding/สีเล็กน้อย, อัปเดต dependency, ปรับ performance |

### หลักปฏิบัติ

1. **เริ่มต้นที่ 1.0.0** — เมื่อ deploy ครั้งแรก (production-ready)
2. **MINOR = 1** — ตัวแรกเป็น 1 เสมอ (1.x.x) แทน 0.x.x เพราะเป็น production แล้ว
3. **BUILD metadata** — ไม่ใช้ (ไม่ต้องมี `+build123`)
4. **PRE-RELEASE** — ถ้าทดสอบก่อน deploy ใช้ `-beta.1`, `-rc.1` ต่อท้าย เช่น `1.2.0-beta.1`
5. **ก่อน commit** — อัปเดต `package.json` → rebuild → commit พร้อม tag `v1.2.3`

### ตัวอย่าง

| เวอร์ชัน | การเปลี่ยนแปลง |
|----------|----------------|
| 1.0.0 | เปิดตัว production ครั้งแรก (5 symptoms, basic auth dashboard + summary + PDF) |
| 1.1.0 | — (no minor release recorded) |
| 1.2.0 | RUNNY_GREEN symptom, child_gender, greeting, PWA icon fix (PNG for iOS), date validation, T12:00 timezone fix |
| 1.3.0 | PDF Export fit-to-page scaling (content in 1 A4 page) |
| 1.4.0 | Avatar upload via Supabase Storage, profile card gradient header |
| 1.4.1 | Bug fix: avatar crash on compressed Blob (`.name` undefined) |
| 1.4.2 | Bug fix: avatar path without extension for upsert overwrite |
| 1.4.3 | Bug fix: avatar cache-busting (`?t={timestamp}`) + iOS HEIC→JPEG support |
| 1.4.4 | Bug fix: iOS PWA html2canvas full capture + multi-page PDF slicing |
| 2.0.0 | Guest Mode: ทดลองใช้งานโดยไม่ต้องสมัคร, localStorage data layer, Guest→Registered data migration |
| 3.0.0 | **UI Redesign — Profile page**: child info card table layout, stats cards (บันทึกเดือนนี้ + ติดต่อกัน), gender pill toggle, logout danger outlined |
