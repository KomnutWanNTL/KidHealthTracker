# 🗂️ Implementation Plan: KidHealth Tracker

> **Source:** `requirements-kidhealth-tracker.md` (v1)
> **Stack:** Vue 3 (Composition API) · Vite · Supabase (Auth + Postgres) · Vercel · Pinia · Tailwind/PrimeVue · jsPDF + html2canvas
> **Estimated Effort:** 10–14 working days (solo developer)

---

## 0. High-Level Milestones

| # | Milestone | Deliverable | Est. Days |
|---|---|---|---|---|
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
| **Total** | | | **~11 days** |

---

## 1. Phase Plan

### Phase 0 — Project Bootstrap (M0)
**Goal:** Runnable Vite app with environment switching wired up.

Tasks:
1. `npm create vite@latest kidhealth-tracker -- --template vue`
2. Install: `vue-router pinia @supabase/supabase-js tailwindcss postcss autoprefixer jspdf html2canvas`
3. `npx tailwindcss init -p` → configure `content: ["./index.html","./src/**/*.{vue,js}"]`
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
    symptom in ('NORMAL','RUNNY_CLEAR','FEVER','FEVER_RUNNY_CLEAR','FEVER_RUNNY_GREEN')
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
   - Layout per spec mockup: 5 SymptomCards in 2-column grid (last row full-width)
   - "บันทึก" button disabled until symptom selected
   - On save: `logs.upsertLog()` → toast "บันทึกแล้ว ✓" / error toast on failure
   - Link to `/summary`
   - Header with Logout
5. Date input: `<input type="date" :max="today">`

**Acceptance:**
- First-time user on today → empty state, save works
- Reload page → today's saved value is pre-selected
- Pick yesterday → loads yesterday's value (if any)
- Pick tomorrow → input is blocked (`max` attr + JS guard)
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
   - Legend: 5 rows from `SYMPTOMS`
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

**Acceptance:**
- Click Export → PDF downloads
- PDF contains: month label, full calendar grid, legend, counts
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
|---|---|---|---|
| 1 | Register new user, confirm email | Redirects to dashboard | ☐ |
| 2 | Login wrong password | Error message shown | ☐ |
| 3 | Login correct | Redirects to dashboard | ☐ |
| 4 | Save symptom first time | Toast "บันทึกแล้ว ✓" | ☐ |
| 5 | Reopen same date | Pre-selected | ☐ |
| 6 | Change saved value | Upsert works (1 row total) | ☐ |
| 7 | Pick future date | Blocked | ☐ |
| 8 | Switch month in Summary | Loads new data | ☐ |
| 9 | Counts add up | sum = days with logs | ☐ |
| 10 | Export PDF | File downloads, layout intact | ☐ |
| 11 | Logout | Session cleared, redirect to /login | ☐ |
| 12 | RLS: another user tries to query your rows | Returns 0 rows | ☐ |
| 13 | Mobile (375px) | All flows usable | ☐ |
| 14 | Register with first_name + last_name → profile auto-created | Profile shows name | ☐ |
| 15 | Edit child_name + child_birthday → save → reload | Values persist | ☐ |
| 16 | Age auto-calculated correctly from child_birthday | Shows "X ปี Y เดือน" | ☐ |

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
kidhealth-tracker/
├── .env.development
├── .env.production          (gitignored)
├── .env.local               (gitignored)
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── vercel.json              (optional)
└── src/
    ├── main.js
    ├── App.vue
    ├── assets/
    │   └── main.css         (Tailwind directives)
    ├── components/
    │   ├── SymptomCard.vue
    │   ├── CalendarGrid.vue
    │   ├── MonthPicker.vue
    │   ├── Legend.vue
    │   ├── ToastContainer.vue
    │   └── AppHeader.vue
    ├── composables/
    │   ├── useExportPdf.js
    │   └── useToast.js
    ├── constants/
    │   └── symptoms.js
    ├── lib/
    │   └── supabase.js
    ├── pages/
    │   ├── LoginPage.vue
    │   ├── RegisterPage.vue
    │   ├── DashboardPage.vue
    │   ├── SummaryPage.vue
    │   ├── ProfilePage.vue
    │   └── VerifyEmailPage.vue
    ├── router/
    │   └── index.js
    └── stores/
        ├── auth.js
        ├── logs.js
        └── profile.js
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
  - [ ] No dark mode
  - [ ] No "forgot password" custom UI (Supabase default works)

---

## 6. Suggested Execution Order (Day-by-Day)

| Day | Tasks |
|---|---|---|
| 1 | M0 (bootstrap) + M1 (Supabase setup) |
| 2 | M2 (auth pages + store + guard) |
| 3 | M2 wrap-up + start M3 (dashboard UI) |
| 4 | M3 finish (upsert + edit mode) |
| 5 | M4 (calendar grid + month fetch) |
| 6 | M4 finish (legend + counts) |
| 7 | M5 (PDF export) |
| 8 | M6 (polish + toast + a11y) |
| 9 | M7 (Profile: profiles table, store, register fields, editable child info) |
| 10 | M8 (Vercel deploy) |
| 11 | M9 (QA matrix) + bug fixes |

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
| 1.0.0 | เปิดตัว production ครั้งแรก |
| 1.0.1 | แก้บั๊ก link ยืนยัน email |
| 1.0.2 | แก้ UI padding, เพิ่ม loading spinner |
| 1.1.0 | เพิ่ม export CSV, เพิ่มหน้า Settings |
| 1.2.0 | เพิ่ม symptom RUNNY_GREEN, เพิ่มโทนสีใหม่ |
| 2.0.0 | เปลี่ยน DB schema, redesign ใหม่ทั้งตัว |
