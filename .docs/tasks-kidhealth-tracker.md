# ✅ KidHealth Tracker — Task Checklist

> Source: `requirements-kidhealth-tracker.md` · `plan-kidhealth-tracker.md`
> Stack: Vue 3 (Composition API) · Vite · Supabase · Vercel · Tailwind · Pinia · jsPDF + html2canvas

---

## 🔧 คำแนะนำก่อนเริ่ม

1. **Supabase:** ต้องมี 2 projects (`kidhealth-dev`, `kidhealth-prd`) + API keys
2. **Vercel:** account พร้อม deploy (M7)
3. **Git:** `git init` และ push ขึ้น GitHub ก่อน M7

---

## 📁 File Structure (เป้าหมาย)

```
KidHealthTracker/
├── .env.development      # dev keys (placeholder)
├── .env.production       # prod keys (gitignored)
├── .env.local            # override (gitignored)
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── vercel.json           (optional)
└── src/
    ├── main.js
    ├── App.vue
    ├── assets/main.css
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
    │   └── VerifyEmailPage.vue
    ├── router/
    │   └── index.js
    └── stores/
        ├── auth.js
        └── logs.js
```

---

## 🎯 Milestone 0 — Project Bootstrap

**Est:** 0.5 day

### Tasks

- [x] **M0.1** `npm create vite@latest . -- --template vue` ใน `KidHealthTracker/`
- [x] **M0.2** ติดตั้ง dependencies
- [x] **M0.3** ตั้งค่า Tailwind v4
- [x] **M0.4** สร้าง `.env.development` (ใส่ dev keys จริงแล้ว)
- [x] **M0.5** สร้าง `.env.production` (placeholder, gitignored)
- [x] **M0.6** `.env.local` → gitignored
- [x] **M0.7** `.gitignore` → อัปเดต
- [x] **M0.8** `src/lib/supabase.js`
- [x] **M0.9** สร้าง directory structure ทั้งหมด
- [x] **M0.10** Verify: `npm run dev` → HTTP 200

---

## 🎯 Milestone 1 — Supabase Backend

**Est:** 0.5 day · **ต้องมี Supabase projects + API keys ก่อน**

### Tasks

- [x] **M1.1** สร้าง dev project `kidhealth-dev` ใน Supabase dashboard
- [ ] **M1.2** สร้าง prod project `kidhealth-prd` ใน Supabase dashboard (รอทีหลัง)
- [x] **M1.3** รัน SQL migration ใน dev project (table + RLS + trigger + index)
- [x] **M1.4** เปิด "Confirm email" ใน dev project
- [x] **M1.5** สร้าง test user `test1@kidhealth.dev` (UUID: `e348debe-b557-4b6e-b48f-b245aad3f3d7`)
- [x] **M1.6** Insert dummy logs 14 rows (พ.ค. 3 + มิ.ย. 11)
- [x] **M1.7** ใส่ API keys จริงลงใน `.env.development` แล้ว
- [x] **M1.8** Verify: table `daily_logs` query ได้ → `{"count":0}`

---

## 🎯 Milestone 2 — Authentication

**Est:** 1.5 days

### Tasks

- [x] **M2.1** `src/stores/auth.js` (Pinia) — session, user, loading, init, signIn, signUp, signOut, onAuthChange
- [x] **M2.2** `src/router/index.js` — routes + auth guard (redirect logic)
- [x] **M2.3** `src/pages/LoginPage.vue` — form + error + redirect
- [x] **M2.4** `src/pages/RegisterPage.vue` — form + validation + verify message
- [x] **M2.5** `src/pages/VerifyEmailPage.vue` — รอ confirm + redirect
- [x] **M2.6** `App.vue` — `auth.init()` ก่อน mount
- [x] **M2.7** Logout button — `AppHeader.vue` ใช้ใน Dashboard + Summary แล้ว
- [x] **M2.8** Test: register → email → confirm → dashboard

---

## 🎯 Milestone 3 — Daily Log (Dashboard)

**Est:** 1.5 days

### Tasks

- [x] **M3.1** `src/constants/symptoms.js` — SYMPTOMS array + SYMPTOM_MAP
- [x] **M3.2** `src/stores/logs.js` (Pinia) — fetchForDate, fetchMonth, upsertLog
- [x] **M3.3** `src/components/SymptomCard.vue` — backed-color card, ring when selected, role="radio"
- [x] **M3.4** `src/pages/DashboardPage.vue` — date picker, load existing, 5 cards, save button, toast, link to summary
- [x] **M3.5** `src/components/AppHeader.vue` — ชื่อแอพ + Logout
- [x] **M3.6** Test: save → reload → pre-selected → edit → upsert

---

## 🎯 Milestone 4 — Summary / Calendar

**Est:** 1.5 days

### Tasks

- [x] **M4.1** `src/components/MonthPicker.vue` — ←→ buttons, พ.ศ. labels, can't go future
- [x] **M4.2** `src/components/CalendarGrid.vue` — 7-col grid, colored cells, data-date, future disabled
- [x] **M4.3** `src/components/Legend.vue` — 5 swatches + counts
- [x] **M4.4** `src/pages/SummaryPage.vue` — MonthPicker + CalendarGrid + Legend + loading + AppHeader + export button
- [x] **M4.5** Test: switch month → data loads → counts match → future disabled

---

## 🎯 Milestone 5 — PDF Export

**Est:** 1 day

### Tasks

- [x] **M5.1** `src/composables/useExportPdf.js` — html2canvas + jsPDF, scale 2, A4 portrait
- [x] **M5.2** SummaryPage: calendar wrapper ref → exportCalendar()
- [x] **M5.3** Loading state ("กำลังส่งออก...") + disabled button
- [x] **M5.4** Title header "KidHealth Tracker — เดือน ปี พ.ศ." inside captured area
- [x] **M5.5** Test: Chrome + Safari → PDF loads with correct layout

---

## 🎯 Milestone 6 — UX Polish

**Est:** 1 day

### Tasks

- [x] **M6.1** `src/composables/useToast.js` + `src/components/ToastContainer.vue`:
  - success / error / info variants
  - auto-dismiss 3s
  - ต่อใน `App.vue` แล้ว
- [x] **M6.2** Loading states while fetching month data (SummaryPage)
- [x] **M6.3** Empty state: นับจำนวนวันที่ไม่มีข้อมูลแสดงใน Legend
- [x] **M6.4** Responsive:
  - SymptomCard grid → 1 col on `< sm`
  - Calendar shrinks gracefully
- [x] **M6.5** Accessibility:
  - `<label>` on all inputs
  - SymptomCards: `role="radio"` + `role="radiogroup"`
  - focus rings
- [x] **M6.6** Thai font stack (`Sarabun`, `Noto Sans Thai` in `base.css`)

---

## 🎯 Milestone 7 — Profile Features (ชื่อลูก, วันเกิด, อายุอัตโนมัติ)

**Est:** 1 day

### 7.1 Database
- [x] **M7.1** รัน SQL migration เพิ่มตาราง `profiles` ใน dev project (และ prod project ทีหลัง)
- [x] **M7.2** Verify: `select * from profiles;` → empty table (OK)

### 7.2 Frontend — Profile Store
- [x] **M7.3** สร้าง `src/stores/profile.js` (Pinia):
  - `fetchProfile()` — โหลด profile หรือ auto-create จาก `user_metadata` ถ้ายังไม่มี
  - `updateProfile({ child_name, child_birthday, ... })` — upsert ข้อมูล

### 7.3 Frontend — Register Page
- [x] **M7.4** เพิ่ม `first_name` (ชื่อจริง) field ใน RegisterPage.vue
- [x] **M7.5** เพิ่ม `last_name` (นามสกุล) field ใน RegisterPage.vue
- [x] **M7.6** ส่ง `options.data = { first_name, last_name }` ใน `auth.signUp()`

### 7.4 Frontend — Profile Page
- [x] **M7.7** ProfilePage.vue: โหลด profile จาก `profileStore.fetchProfile()` on mount
- [x] **M7.8** แสดงชื่อเต็ม (first_name + last_name) ใน gradient header แทน "คุณ..."
- [x] **M7.9** child_name: เปลี่ยนจาก static text เป็น `<input>` แก้ไขได้
- [x] **M7.10** child_birthday: เปลี่ยนจาก static text เป็น `<input type="date">`
- [x] **M7.11** แสดงอายุลูก auto-calculate จาก child_birthday (เป็น "X ปี Y เดือน", "X เดือน", หรือ "X วัน")
- [x] **M7.12** ปุ่ม "บันทึก" — เรียก `profileStore.updateProfile()` → toast success
- [x] **M7.13** Logout button (เหมือนเดิม)

### 7.5 Frontend — Auth Store
- [x] **M7.14** แก้ `auth.signUp()` ให้รับ `options` parameters (first_name, last_name) และส่งเป็น `options.data`

---

## 🎯 Milestone 8 — Deploy to Vercel

**Est:** 0.5 day

### Tasks

- [ ] **M8.1** `git init` + commit + push to GitHub
- [ ] **M8.2** Import project in Vercel
- [ ] **M8.3** Set Environment Variables (Production = prod, Preview = dev)
- [ ] **M8.4** Configure Production branch = `main`
- [ ] **M8.5** Test: Production URL → prod Supabase / Preview URL → dev Supabase
- [ ] **M8.6** `vercel.json` (ถ้าต้องการ SPA fallback):
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```

---

## 🎯 Milestone 9 — QA / UAT

**Est:** 1.5 days

### Test Matrix

- [ ] **T1** Register new user → confirm email → redirect dashboard
- [ ] **T2** Login wrong password → error message
- [ ] **T3** Login correct → redirect dashboard
- [ ] **T4** Save symptom first time → toast "บันทึกแล้ว ✓"
- [ ] **T5** Reopen same date → pre-selected
- [ ] **T6** Change saved value → upsert (1 row)
- [ ] **T7** Pick future date → blocked
- [ ] **T8** Switch month in Summary → loads new data
- [ ] **T9** Counts add up → sum = days with logs
- [ ] **T10** Export PDF → file downloads
- [ ] **T11** Logout → session cleared → redirect /login
- [ ] **T12** RLS: user A cannot see user B's rows → 0 rows
- [ ] **T13** Mobile (375px) → all flows usable
- [ ] **T14** Register with first_name + last_name → profile auto-created on first login
- [ ] **T15** Edit child_name + child_birthday → save → reload → values persist
- [ ] **T16** Age auto-calculated correctly from child_birthday

---

## 🔗 Quick Reference

| Command | Description |
|---|---|
| `npm run dev` | Dev server (uses `.env.development`) |
| `npm run build` | Build for production (uses `.env.production`) |
| `npm run preview` | Preview production build locally |
| `npx supabase login` | Login to Supabase CLI (optional) |
| `vercel --prod` | Deploy to production |
| `vercel` | Deploy to preview |

---

## 📝 Notes

- **`VITE_SUPABASE_ANON_KEY`** ใน `.env.development` และ `.env.production` ต้องใส่ค่าจริงจาก Supabase Dashboard ก่อนรัน
- **`.env.production`** ห้าม commit ขึ้น Git → ใส่ใน Vercel Dashboard แทน
- Tailwind ใช้ v4 (approach: `@import "tailwindcss"` + `@tailwindcss/vite` plugin)
- Date format: Thai locale / DD/MM/2569
- **M7 (Profile):** ต้องรัน SQL migration เพิ่ม `profiles` table ก่อน (ดู `supabase-setup-guide.md`)
