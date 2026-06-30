# ✅ KidHealth Tracker — Task Checklist

> Source: `requirements-kidhealth-tracker.md` · `plan-kidhealth-tracker.md`
> Stack: Vue 3 (Composition API) · Vite · Supabase · Vercel · Tailwind · Pinia · jsPDF + html2canvas · vite-plugin-pwa

---

## 🔧 คำแนะนำก่อนเริ่ม

1. **Supabase:** ต้องมี 2 projects (`kidhealth-dev`, `kidhealth-prd`) + API keys
2. **Vercel:** account พร้อม deploy (M7)
3. **Git:** `git init` และ push ขึ้น GitHub ก่อน M7

---

## 📁 File Structure (Actual)

```
KidHealthTracker/
├── .env.development          # dev keys (committed)
├── .env.production           # prod keys (gitignored)
├── .env.local                # override (gitignored)
├── .gitignore
├── index.html                # PWA meta tags + Sarabun font + manifest
├── package.json
├── vite.config.js            # Vue + Tailwind v4 + VitePWA plugins + @ alias
├── vercel.json               # SPA fallback rewrites
├── public/
│   ├── favicon-v2.svg
│   ├── pwa-icon-v2.svg       # PWA home screen icon (SVG, purpose: maskable)
│   ├── pwa-icon-152.png      # iOS iPad Retina A2HS icon
│   ├── pwa-icon-180.png      # iOS iPhone Retina A2HS icon
│   ├── pwa-icon-192.png      # PWA icon 192×192 PNG
│   └── pwa-icon-512.png      # PWA icon 512×512 PNG (purpose: maskable)
└── src/
    ├── main.js               # bootstrap: Pinia → auth.init() → router → mount
    ├── App.vue               # loading splash + router-view + BottomNav + ToastContainer
    ├── style.css             # @import entry: tokens → typography → base → components → tailwindcss
    ├── lib/
    │   └── supabase.js       # createClient from env vars
    ├── router/
    │   └── index.js          # 8 routes + auth guard beforeEach
    ├── stores/
    │   ├── auth.js           # session, user, loading, init/signIn/signUp/signOut
    │   ├── logs.js           # fetchForDate, fetchMonth, upsertLog
    │   └── profile.js        # fetch, update, uploadAvatar (cache-busting)
    ├── pages/
    │   ├── LoginPage.vue
    │   ├── RegisterPage.vue  # first_name + last_name fields
    │   ├── VerifyEmailPage.vue
    │   ├── ForgotPasswordPage.vue  # forgot password form (v4.0.0)
    │   ├── ResetPasswordPage.vue   # set new password form (v4.0.0)
    │   ├── DashboardPage.vue # date picker, 6 symptom cards, avatar header
    │   ├── SummaryPage.vue   # month picker, calendar, legend, export PDF
    │   └── ProfilePage.vue   # profile card, avatar upload, child info, gender, age calc
    ├── components/
    │   ├── BottomNav.vue     # 3-tab bottom nav (Dashboard/Summary/Profile)
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
    │   └── symptoms.js       # 6 symptoms: code, label, emoji, color, tint, border, cssClass
    └── styles/
        ├── tokens.css        # design tokens (colors, spacing, shadows, radius)
        ├── typography.css    # Sarabun type scale
        ├── base.css          # reset, body, scroll, focus
        └── components/
            ├── button.css
            ├── input.css
            ├── symptom-card.css
            ├── calendar.css
            ├── bottom-nav.css
            └── toast.css
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
- [x] **M1.2** สร้าง prod project `kidhealth-prd` ใน Supabase dashboard (URL: `njadmgqzywqqqbrmxssl.supabase.co`)
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
  - Root `/` now redirects to `/login` (not `/dashboard`)  
  - auth guard `beforeEach` checks `loading` + `requiresAuth` + redirect for authenticated users on `/login`/`/register`
- [x] **M2.3** `src/pages/LoginPage.vue` — form + error + redirect
- [x] **M2.4** `src/pages/RegisterPage.vue` — form + validation + verify message
  - **Bug fix:** เพิ่ม `options.emailRedirectTo = ${window.location.origin}/login`  
    เพื่อให้ confirmation link redirect ไปหน้า Login (ไม่ใช่ localhost)
- [x] **M2.5** `src/pages/VerifyEmailPage.vue` — รอ confirm + redirect
- [x] **M2.6** `main.js` — `auth.init()` ก่อน `app.use(router)` และ `app.mount()`
  - **Bug fix:** ย้าย `app.use(router)` ไว้หลัง `await useAuthStore().init()`  
    ป้องกัน navigation เริ่มก่อน auth init → guard เห็น `loading: true` → ปล่อยผ่าน → user ถึง Dashboard โดยไม่ login
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

## 🎯 Milestone 8 — Bug Fixes & PWA Support

**Est:** 0.5 day

### Tasks

- [x] **M8.1** แก้ Bug: root `/` redirect `/dashboard` → เปลี่ยนเป็น `/login`
- [x] **M8.2** แก้ Bug: `app.use(router)` ก่อน auth init → ย้าย `app.use(router)` หลัง `await useAuthStore().init()` ใน `main.js`
- [x] **M8.3** แก้ Bug: confirmation email redirect ไป `localhost` → เพิ่ม `options.emailRedirectTo` ใน `RegisterPage.vue`
- [x] **M8.4** ติดตั้ง `vite-plugin-pwa` (npm)
- [x] **M8.5** ตั้งค่า `VitePWA` plugin ใน `vite.config.js` — manifest + Workbox service worker
- [x] **M8.6** สร้าง `public/pwa-icon.svg` — 512×512 SVG icon สำหรับ PWA
- [x] **M8.7** อัปเดต `index.html` — manifest link, apple-touch-icon, mobile-web-app meta tags
- [x] **M8.8** Verify: `npm run build` → PWA assets generated (`sw.js`, `manifest.webmanifest`)
- [x] **M8.9** 🐞 Bug: iOS Add to Home Screen Icon ไม่ขึ้น — **Fixed:** เพิ่ม 180×180 + 152×152 PNG, เปลี่ยน apple-touch-icon จาก SVG → PNG

---

### 🐞 Bug: iOS Add to Home Screen Icon ไม่ขึ้น (M8.9)

**รายงาน:** ใช้ iPhone ผ่าน Safari / Chrome ทำ Add to Home Screen แล้ว icon ไม่ขึ้น (เป็น blank/default)

#### Root Cause Analysis

| # | สาเหตุ | ระดับ |
|---|--------|-------|
| 1 | **`apple-touch-icon` ใน `index.html` ชี้ไปที่ไฟล์ SVG** — iOS Safari ไม่รองรับ SVG เป็น Home Screen icon ต้องใช้ PNG เท่านั้น (iOS ใช้ WebKit render engine ซึ่งอ่าน SVG ไม่ได้สำหรับ A2HS) | 🔴 High |
| 2 | **Manifest icons ไม่มีขนาด 180×180** — iOS ใช้ 180×180 px สำหรับ iPhone Retina (จอ standard) แต่ใน manifest มีแค่ 192×192 กับ 512×512 PNG | 🟡 Medium |
| 3 | **iOS 16.4+ สามารถอ่าน manifest ได้บางส่วน แต่ SVG icon ที่มี `sizes: 'any'` ยังใช้ไม่ได้** | 🟡 Medium |

> **หมายเหตุ:** Chrome บน iOS ก็ใช้ WebKit engine เดียวกับ Safari ดังนั้นมีพฤติกรรมเดียวกัน

#### Current State (ไฟล์ที่เกี่ยวข้อง)

**`index.html` (บรรทัด 6):**
```html
<link rel="apple-touch-icon" href="/pwa-icon-v2.svg" />  <!-- ❌ SVG → iOS ไม่แสดง -->
```

**`vite.config.js` — manifest icons (บรรทัด 26-45):**
```js
icons: [
  { src: 'pwa-icon-v2.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },  // ❌ iOS ignores SVG
  { src: 'pwa-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },           // ⚠️ ไม่ใช่ขนาด 180×180
  { src: 'pwa-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },  // ⚠️ ไม่ใช่ขนาด 180×180
]
```

#### Proposed Fix

1. **สร้างไฟล์ `public/pwa-icon-180.png` (180×180 px)** — resize จาก `pwa-icon-192.png` ที่มีอยู่ (หรือ export ใหม่จาก SVG ต้นฉบับ)
2. **สร้างไฟล์ `public/pwa-icon-152.png` (152×152 px)** — สำหรับ iPad Retina
3. **แก้ `index.html`** — เปลี่ยน `apple-touch-icon` ให้ชี้ไปที่ PNG พร้อม `sizes` attribute:

   ```html
   <link rel="apple-touch-icon" sizes="180x180" href="/pwa-icon-180.png" />
   <link rel="apple-touch-icon" sizes="152x152" href="/pwa-icon-152.png" />
   <!-- keep SVG only for non-iOS browsers -->
   <link rel="apple-touch-icon" href="/pwa-icon-v2.svg" />
   ```

4. **แก้ `vite.config.js`:**
   - เพิ่ม `pwa-icon-180.png` และ `pwa-icon-152.png` ใน `includeAssets`
   - เพิ่ม icon entries ใน manifest:

   ```js
   { src: 'pwa-icon-180.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
   { src: 'pwa-icon-152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
   ```

5. **Build ใหม่ และทดสอบบน iPhone จริง** (ต้อง clear cache / ลบเว็บออกจาก Home screen แล้ว Add ใหม่)

#### Files to Modify

| File | Change |
|------|--------|
| `public/pwa-icon-180.png` | **New** — 180×180 PNG |
| `public/pwa-icon-152.png` | **New** — 152×152 PNG |
| `index.html` | แก้ `apple-touch-icon` link → ใช้ PNG + sizes |
| `vite.config.js` | เพิ่ม new PNGs ใน `includeAssets` + manifest icons |

#### References
- [Apple Developer: Configuring Web Application Icons](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications.html)
- [iOS 16.4+ PWA Manifest Support](https://webkit.org/blog/13808/web-push-for-web-apps-on-ios-16-4/)

---

## 🎯 Milestone 9 — Deploy to Vercel

**Est:** 0.5 day

### Tasks

- [x] **M9.1** `git init` + commit + push to GitHub
- [x] **M9.2** Import project in Vercel
- [x] **M9.3** Set Environment Variables (Production = prod, Preview = dev)
- [x] **M9.4** Configure Production branch = `main`
- [x] **M9.5** Test: Production URL → prod Supabase / Preview URL → dev Supabase
- [x] **M9.6** `vercel.json` (SPA fallback) — สร้างแล้ว

---

## 🎯 Milestone 10 — QA / UAT (v1.0.0)

**Est:** 1.5 days

### Test Matrix

- [x] **T1** Register new user → confirm email → redirect dashboard
- [x] **T2** Login wrong password → error message
- [x] **T3** Login correct → redirect dashboard
- [x] **T4** Save symptom first time → toast "บันทึกแล้ว ✓"
- [x] **T5** Reopen same date → pre-selected
- [x] **T6** Change saved value → upsert (1 row)
- [x] **T7** Pick future date → blocked
- [x] **T8** Switch month in Summary → loads new data
- [x] **T9** Counts add up → sum = days with logs
- [x] **T10** Export PDF → file downloads
- [x] **T11** Logout → session cleared → redirect /login
- [x] **T12** RLS: user A cannot see user B's rows → 0 rows
- [x] **T13** Mobile (375px) → all flows usable
- [x] **T14** Register with first_name + last_name → profile auto-created on first login
- [x] **T15** Edit child_name + child_birthday → save → reload → values persist
- [x] **T16** Age auto-calculated correctly from child_birthday
- [x] **T17** Open root `/` when not logged in → redirect `/login` (not Dashboard)
- [x] **T18** Register → receive email → click link → redirect `/login` (not localhost)
- [x] **T19** PWA: Chrome DevTools → Manifest valid, Service Worker registered
- [x] **T20** PWA: iOS Safari → "Add to Home Screen" shows app icon + name
- [x] **T21** เลือกเพศลูก (ชาย/หญิง) → header dashboard แสดง icon ตรงเพศ
- [x] **T22** บันทึกวันในอนาคต → แสดง error "ไม่สามารถบันทึกวันในอนาคตได้"
- [x] **T23** PWA manifest ต้อง valid (manifest.webmanifest มี PNG + SVG icons)

---

## 🎯 Milestone 17 — QA: Guest Mode Tests (v2.0.0)

**Est:** 0.5 day

### Test Matrix

- [ ] **G1** กด "ทดลองใช้งาน" → เข้า Dashboard ทันที, ไม่ต้องกรอกข้อมูล
- [ ] **G2** Guest Dashboard: เลือกวันที่ + บันทึกอาการ → toast "บันทึกอาการแล้ว (บันทึกในเครื่อง)"
- [ ] **G3** Guest Dashboard: เปลี่ยนวันที่ → reload → ข้อมูลเดิมยังอยู่
- [ ] **G4** Guest Summary: แสดงปฏิทินสีจาก localStorage data → counts ถูกต้อง
- [ ] **G5** Guest Summary: Export PDF → ดาวน์โหลดได้, เนื้อหาครบถ้วน
- [ ] **G6** Guest Profile: แสดง upgrade prompt + จำนวนวันที่บันทึกถูกต้อง
- [ ] **G7** Guest Profile: กด "สมัครสมาชิก (คงข้อมูลเดิม)" → ไป `/register`
- [ ] **G8** Guest Profile: กด "เข้าสู่ระบบ (ถ้ามีบัญชีอยู่แล้ว)" → ไป `/login`
- [ ] **G9** Guest → สมัครสมาชิก → ยืนยัน email → login → ข้อมูล migrate ไป Supabase
- [ ] **G10** หลัง migrate → เปิด Dashboard → ข้อมูลเดิมแสดง (จาก Supabase)
- [ ] **G11** หลัง migrate → localStorage ไม่มี `guestLogs` และ `guest_id`
- [ ] **G12** Guest → Login (มีบัญชี) → ไม่ migrate (ไม่มี guest data)
- [ ] **G13** Guest Banner แสดงในทุก protected page (Dashboard, Summary, Profile)
- [ ] **G14** Guest → สมัคร → ยังไม่ confirm email → กลับมาใช้ Guest ต่อได้
- [ ] **G15** เปิดแอพใน Safari Private Mode → Guest Mode แจ้ง error (localStorage ปิด)
- [ ] **G16** Guest → clear browser data → ข้อมูลหาย → เปิดใหม่ → เข้า Guest ใหม่ได้
- [ ] **G17** Guest → logout (ออกจาก Guest) → กลับ `/login` → กด Guest อีกครั้ง → ข้อมูลเดิม (ถ้ายังไม่ clear)
- [ ] **G18** Future date validation ยังทำงานใน Guest Mode
- [ ] **G19** iOS Safari / PWA: Guest Mode ทำงาน (localStorage มีใน PWA)

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

## 🎯 Milestone 10b — Post-Launch Improvements (v1.2.0)
 
**Est:** 0.5 day
 
### Tasks
 
- [x] **M10b.1** เพิ่ม greeting "พ่อแม่น้อง{ชื่อลูก}" แทน "คุณพ่อคุณแม่ของ{ชื่อลูก}"
- [x] **M10b.2** เพิ่ม child_gender field + gender selector ใน ProfilePage
- [x] **M10b.3** แสดง icon เด็กผู้ชาย/ผู้หญิงที่ header dashboard ตาม child_gender
- [x] **M10b.4** แก้ไข: `today` เป็น computed ref ป้องกันค่าเก่าค้าง
- [x] **M10b.5** แก้ไข: เพิ่ม `date > today` validation ใน logs store (ป้องกันบันทึกวันอนาคต)
- [x] **M10b.6** แก้ไข: PWA manifest filename (manifest.json → manifest.webmanifest)
- [x] **M10b.7** เพิ่ม PNG icons (192×192 + 512×512) สำหรับ PWA compatibility
- [x] **M10b.8** เปลี่ยน T00:00:00 → T12:00:00 ป้องกัน timezone edge case
- [x] **M10b.9** เพิ่ม `:max="today"` ใน birthday input ของ ProfilePage
- [x] **M10b.10** Bump version 1.2.0, อัปเดต docs ทั้งหมด

---

## 🎯 Milestone 11 — Bug Fix: PDF Export อยู่หน้าเดียว (v1.3.0) ✅

**Est:** 0.25 day

### Tasks

- [x] **M11.1** วิเคราะห์สาเหตุ: `useExportPdf.js` ใช้ `scale: 2` + portrait A4 → เนื้อหา CalendarGrid + Legend สูงเกิน 277 มม. → ตกหน้า 2
- [x] **M11.2** แก้ `useExportPdf.js`:
  - เพิ่ม `fit` scaling: ถ้า `imgHeight > maxHeight` → ปรับ proportionally ให้พอดีในหน้าเดียว
  - ยกเลิก `while` loop pagination (ไม่ต้องแบ่งหลายหน้า)
  - จัดกึ่งกลางภาพในแนวนอน (`xOffset`)
  - คง `scale: 2` ไว้เพื่อ quality แต่ภาพจะถูกลด proportionally หลัง capture
- [x] **M11.3** ทดสอบกับเดือนที่มีครบ 7 วัน × 5–6 สัปดาห์ + Legend 7 รายการ → ต้องอยู่ในหน้า A4 portrait หน้าเดียว
- [x] **M11.4** ทดสอบกับเดือนที่มี 4 สัปดาห์ (กุมภาพันธ์) → ใช้พื้นที่เต็มหน้า ยังดูดี
- [x] **M11.5** ทดสอบ Chrome + Safari

---

## 🎯 Milestone 12 — Avatar Upload (v1.4.0) ✅

**Est:** 1 day

### 12.1 Database & Storage

- [x] **M12.1** เพิ่ม column `avatar_url text` ในตาราง `profiles` (nullable) — รัน migration ใน dev project ก่อน
- [x] **M12.2** สร้าง bucket `avatars` ใน Supabase Storage Dashboard (public bucket, max 2MB, allow image/jpeg + image/png)
- [x] **M12.3** ตั้ง RLS policies สำหรับ bucket `avatars`:
  - INSERT: user สามารถอัปโหลดไปยัง folder `{auth.uid()}/` เท่านั้น
  - SELECT: authenticated user สามารถอ่านรูปของตัวเองได้
  - UPDATE: user สามารถอัปเดตรูปใน folder ตัวเอง
  - DELETE: user สามารถลบรูปใน folder ตัวเอง

### 12.2 Profile Store

- [x] **M12.4** เพิ่ม action `uploadAvatar(file)` ใน `src/stores/profile.js`:
  - ลบรูปเก่า (ถ้ามี `avatar_url`) → upload ไฟล์ใหม่ไปที่ `storage/avatars/{user_id}/{timestamp}.{ext}`
  - ได้ public URL → update `profiles.avatar_url`
  - return URL
- [x] **M12.5** เพิ่ม action `deleteAvatar()`:
  - ลบไฟล์จาก Storage
  - set `profiles.avatar_url = null`

### 12.3 Profile Page

- [x] **M12.6** แก้ไข `ProfilePage.vue`:
  - Avatar section ใน profile card header: แสดง `<img>` จาก `profile.avatar_url` (ถ้ามี) หรือ fallback emoji (👩)
  - ปุ่ม/overlay "เปลี่ยนรูปโปรไฟล์" ที่คลิก avatar
  - `<input type="file" accept="image/jpeg,image/png" hidden>` ที่ถูก trigger โดยคลิก avatar
  - ขนาด avatar ~80px ใน profile card, `object-fit: cover`, `border-radius: 50%`
- [x] **M12.7** เพิ่ม validation:
  - ขนาดไฟล์ ≤ 700KB → ถ้าเกินจะ auto-compress ผ่าน `<canvas>` (ลด quality + resize) จน ≤700KB
  - type ต้องเป็น image/jpeg หรือ image/png → file picker จำกัดไว้แล้ว
- [x] **M12.8** ขณะ upload: แสดง loading state ("กำลังอัปโหลด...")
- [x] **M12.9** อัปโหลดเสร็จ → preview รูปใหม่ทันที + toast success
- [x] **M12.10** (Optional) ปุ่มลบรูปโปรไฟล์ *(ไม่ใช้ — upload ใช้ upsert ทับของเก่าอัตโนมัติ)*

### 12.4 Dashboard Header

- [x] **M12.11** แก้ไข `DashboardPage.vue`:
  - Avatar link แสดง `<img :src="profileStore.profile?.avatar_url" ...>` ถ้ามี `avatar_url`
  - Fallback: icon emoji ตาม child_gender (👦/👧/👶) หรือ 👩 ถ้าไม่มี gender
- [x] **M12.12** Style: `width: 44px; height: 44px; border-radius: 50%; object-fit: cover;`

### 12.5 General Styles

- [x] **M12.13** เพิ่ม CSS สำหรับ avatar image (base.css หรือ component):
  ```css
  .avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
  ```
- [x] **M12.14** Profile card avatar: ขนาดใหญ่ขึ้น ~80px, object-fit cover, responsive

---

## 🎯 Milestone 13 — Bug Fix: Avatar Upload Crash on Large Images (v1.4.1) ✅

**Est:** 0.1 day

### Tasks

- [x] **M13.1** วิเคราะห์สาเหตุ: `compressImage()` คืนค่า `Blob` (ไม่มี `.name`) → `file.name.split('.')` ใน `stores/profile.js` crash
- [x] **M13.2** แก้ `stores/profile.js` line 62: `file.name ? file.name.split('.').pop() : 'jpg'`
- [x] **M13.3** ทดสอบ: รูป <700KB → `File.name` มีค่า → ใช้ `.name.split` ปกติ; รูป >700KB → `file.name` เป็น undefined → fallback `'jpg'`
- [x] **M13.4** Bump version 1.4.1, อัปเดต docs

---

## 🎯 Milestone 17 — Guest Mode (v2.0.0) ✅

### 17.1 Auth Store — Guest State & Actions

- [x] **M17.1.1** เพิ่ม state `isGuest` (bool), `guestId` (string|null) ใน `src/stores/auth.js`
- [x] **M17.1.2** เพิ่ม action `enterGuestMode()`:
  - อ่าน/สร้าง `guest_id` จาก localStorage (`crypto.randomUUID()`)
  - set `isGuest=true`, `guestId=guid`
  - เรียก `logs.setGuestMode(true)` + toast warning
- [x] **M17.1.3** เพิ่ม action `exitGuestMode()`:
  - set `isGuest=false`, `guestId=null`
  - เรียก `logs.setGuestMode(false)`
- [x] **M17.1.4** เพิ่ม action `migrateGuestData()` + `checkAndMigrateGuestData()`:
  - อ่าน guest logs จาก localStorage
  - upsert ทีละ record ไป `daily_logs` ด้วย `auth.user.id`
  - ลบ localStorage guest data หลัง migrate สำเร็จ
  - return `migratedCount`
  - auto-trigger จาก `onAuthStateChange` เมื่อ login

### 17.2 Router — อนุญาต Guest

- [x] **M17.2.1** แก้ `router.beforeEach`:
  ```js
  if (to.meta.requiresAuth && !auth.session && !auth.isGuest) return '/login'
  ```

### 17.3 Logs Store — localStorage Backend

- [x] **M17.3.1** เพิ่ม helper functions: `getGuestLogs()`, `saveGuestLogs()`
- [x] **M17.3.2** แก้ `fetchForDate()`: ถ้า `isGuest` → อ่านจาก localStorage
- [x] **M17.3.3** แก้ `fetchMonth()`: ถ้า `isGuest` → filter เดือนจาก localStorage
- [x] **M17.3.4** แก้ `upsertLog()`: ถ้า `isGuest` → upsert ไป localStorage (ยัง validate future-date)

### 17.4 UI — LoginPage

- [x] **M17.4.1** เพิ่ม `or` divider + ปุ่ม "🚀 ทดลองใช้งาน" (type="button")
- [x] **M17.4.2** `@click` → `auth.enterGuestMode()` → `router.push('/dashboard')`
- [x] **M17.4.3** เพิ่มข้อความใต้ปุ่ม: "ไม่ต้องสมัครสมาชิก ข้อมูลถูกบันทึกในเครื่อง"
- [x] **M17.4.4** style `.btn--ghost` + divider + guest note (`.btn--ghost` มีอยู่แล้วใน button.css)

### 17.5 UI — GuestBanner Component

- [x] **M17.5.1** สร้าง `src/components/GuestBanner.vue`:
  - แถบสีเหลืองอ่อน (amber)
  - icon 🔒 + "โหมดทดลอง" + "ข้อมูลถูกบันทึกในเครื่องนี้เท่านั้น"
  - Link "สมัครเพื่อบันทึกถาวร" → `/register`
  - `v-if="auth.isGuest"`
- [x] **M17.5.2** เพิ่ม GuestBanner ใน DashboardPage, SummaryPage, ProfilePage

### 17.6 UI — DashboardPage Guest Mode

- [x] **M17.6.1** greeting: ถ้า `isGuest` → "สวัสดี ผู้ใช้ทดลอง 👋"
- [x] **M17.6.2** avatar link: ซ่อนหรือใช้ fallback icon เมื่อ Guest
- [x] **M17.6.3** Toast หลังบันทึก: "บันทึกอาการแล้ว (บันทึกในเครื่อง)"

### 17.7 UI — ProfilePage Guest Mode (Upgrade Prompt)

- [x] **M17.7.1** ถ้า `isGuest`: ซ่อน profile card, child info, logout ด้วย `<template v-if>`
- [x] **M17.7.2** แสดง upgrade card:
  - icon 🔒 + "บันทึกข้อมูลของคุณให้ถาวร"
  - จำนวนวันที่บันทึก (จาก localStorage)
  - ปุ่ม "สมัครสมาชิก (คงข้อมูลเดิม)" → `/register`
  - ปุ่ม "เข้าสู่ระบบ (ถ้ามีบัญชีอยู่แล้ว)" → `/login`

### 17.8 UI — SummaryPage Guest Mode

- [x] **M17.8.1** ใช้ localStorage data (ผ่าน logs store ที่ถูกแก้แล้ว) — CalendarGrid/Legend อ่านจาก `logs.monthLogs` โดยตรง
- [x] **M17.8.2** Export PDF ใช้ได้เหมือนเดิม — GuestBanner + guest hint ด้านล่าง

### 17.9 Data Migration Flow

- [x] **M17.9.1** Trigger: `auth.onAuthStateChange` detect session change → `checkAndMigrateGuestData()`
- [x] **M17.9.2** `migrateGuestData()`: อ่าน guest logs → upsert ทุก record → `exitGuestMode()` → clear localStorage
- [x] **M17.9.3** Toast success: "นำเข้าข้อมูลที่ทดลองใช้เรียบร้อย ✓ (X รายการ)"
- [x] **M17.9.4** Safe rollback: clear localStorage **เฉพาะเมื่อ** `!hasError` (ทุก record สำเร็จ)
- [x] **M17.9.5** ป้องกัน double migrate: `checkAndMigrateGuestData()` ตรวจ `hasGuestData` ก่อน; หลัง migrate สำเร็จ localStorage ถูกลบ

### 17.10 Guest Warning Toast

- [x] **M17.10.1** ใน `auth.enterGuestMode()`: toast info
  - "🔒 ข้อมูลจะถูกบันทึกในเครื่องนี้เท่านั้น หากล้างข้อมูลใน browser จะสูญหาย"
- [x] **M17.10.2** ป้องกัน toast ซ้ำ: `if (this.isGuest) return` ที่ต้น `enterGuestMode()`

---

## 🎯 Milestone 16 — Bug Fix: PDF Export ขาดเนื้อหาบน iOS PWA (v1.4.4)

**Est:** 0.25 day

### Tasks

- [x] **M16.1** 🐞 **Bug: PDF Export บน iOS PWA เนื้อหาตก/หาย**
  - **รายงาน:** เมื่อกด Export PDF ผ่าน PWA (Add to Home Screen) บน iPhone/iOS Safari เนื้อหาปฏิทินส่วนล่าง (แถวสุดท้ายของ CalendarGrid + Legend) หายไป หรือ "ตกหน้า 2" ที่ไม่มีอยู่จริง
  - **Environment:** iOS Safari / iOS PWA standalone mode

- [x] **M16.2** **Root Cause Analysis**

  | # | สาเหตุ | ระดับ |
  |---|--------|-------|
  | 1 | **html2canvas บน iOS Safari จับเฉพาะ viewport ที่เห็น** — html2canvas ใช้ `window.innerHeight` / `window.innerWidth` เป็นค่าเริ่มต้นสำหรับ rendering canvas บน iOS WebKit ถ้า element ที่จะ capture มีความสูงเกิน viewport จะ render เฉพาะส่วนที่เห็นบนจอเท่านั้น ส่วนที่ scroll หายไปจะไม่รวมใน canvas | 🔴 High |
  | 2 | **ไม่มี fallback dimension options** — `useExportPdf.js` ไม่ได้ส่ง `height`/`width`/`windowHeight`/`windowWidth` options ไปให้ html2canvas เพื่อกำหนด bounding box ของการ capture ทำให้ iOS ใช้ viewport dimensions แทน | 🔴 High |
  | 3 | **ไม่มี multi-page logic** — ถึงแม้ M11 (v1.3.0) จะเพิ่ม scaling เพื่อให้เนื้อหาพอดีในหน้าเดียว แต่ scaling ใช้ได้เมื่อ canvas มีเนื้อหาครบถ้วนเท่านั้น ถ้า canvas ถูกตัดตั้งแต่ต้น การ scale ก็แค่ย่อเนื้อหาที่ไม่สมบูรณ์ | 🟡 Medium |

- [x] **M16.3** **Fix `useExportPdf.js`:**

  **Change 1 — iOS html2canvas full capture:**
  ```js
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    height: element.scrollHeight,      // ← NEW: บอก html2canvas ว่า element สูงเท่าไหร่
    width: element.scrollWidth,         // ← NEW: บอก html2canvas ว่า element กว้างเท่าไหร่
    windowHeight: element.scrollHeight, // ← NEW: บังคับ iOS ให้ render ทั้ง element
    windowWidth: element.scrollWidth,   // ← NEW: บังคับ iOS ให้ render ทั้ง element
  })
  ```

  **Change 2 — Multi-page slicing (เมื่อ content ยังสูงเกิน 1 หน้า A4):**
  - ถ้า `imgHeight <= maxHeight` → single page (center vertically)
  - ถ้า `imgHeight > maxHeight` → slice canvas เป็นส่วนๆ ตามความสูง A4 → `addPage()` + `addImage()` ต่อชิ้น
  - ใช้ `ctx.drawImage(canvas, sx, sy, sw, sh, dx, dy, dw, dh)` crop ทีละ page-sized slice
  - แต่ละ slide สร้าง temp canvas ใหม่เพื่อไม่ให้กระทบต้นฉบับ

  **Files to modify:**
  | File | Change |
  |------|--------|
  | `src/composables/useExportPdf.js` | เพิ่ม dimension options + multi-page slicing |

- [x] **M16.4** ทดสอบ:
  - iOS Safari จริง: Export PDF → เนื้อหาครบทุกแถวของ CalendarGrid + Legend
  - iOS PWA (Add to Home Screen): Export → เนื้อหาครบถ้วน
  - Chrome Desktop: ยังทำงานเหมือนเดิม ไม่ regression
  - Safari macOS: ยังทำงานเหมือนเดิม ไม่ regression
  - เดือนที่มี 6 สัปดาห์ (calendar สูง): ถ้า content > 1 หน้า → split อัตโนมัติ
  - เดือนที่มี 4-5 สัปดาห์: single page กึ่งกลาง

- [x] **M16.5** Bump version `1.4.4`, อัปเดต docs

---

## 📝 Notes

- **`VITE_SUPABASE_ANON_KEY`** ใน `.env.development` และ `.env.production` ต้องใส่ค่าจริงจาก Supabase Dashboard ก่อนรัน
- **`.env.production`** ห้าม commit ขึ้น Git → ใส่ใน Vercel Dashboard แทน
- Tailwind ใช้ v4 (approach: `@import "tailwindcss"` + `@tailwindcss/vite` plugin)
- Date format: Thai locale / DD/MM/2569
- **M7 (Profile):** ต้องรัน SQL migration เพิ่ม `profiles` table ก่อน (ดู `supabase-setup-guide.md`)
- **Bug Fixes (M8):**
  - Root `/` redirect → `/login` (เดิม `/dashboard`) เพื่อป้องกัน user ไม่ได้ login แล้วเห็น Dashboard
  - `app.use(router)` ต้องอยู่หลัง `await useAuthStore().init()` — ถ้าสลับกัน guard จะเห็น `loading: true` และปล่อยทุก navigation ผ่าน
  - `emailRedirectTo` ต้องส่งไปกับ `signUp()` เพื่อให้ email confirmation กลับมาที่ Login page
- **PWA (M8):** ใช้ `vite-plugin-pwa` สร้าง service worker + manifest อัตโนมัติตอน build
- **M11 (PDF fix v1.3.0):** เปลี่ยนจาก pagination → scale proportionally เพื่อให้ทุกอย่างอยู่ใน A4 portrait หน้าเดียว
  - `useExportPdf.js`: ถ้า imgHeight > pageHeight → recalculate width ให้พอดี
  - คง `scale: 2` → quality ยังดี แต่ scaled down proportionally
- **M12 (Avatar Upload v1.4.0):**
  - ต้องสร้าง bucket `avatars` ใน Supabase Storage ก่อน
  - Column `avatar_url` ใน `profiles` table ต้องมีก่อน deploy
  - RLS policies สำหรับ Storage ต้อง set ให้ถูกต้อง
  - Public bucket = avatar images readable without auth token (RLS only controls write)
- **M13 (Avatar Upload Bug Fix v1.4.1):**
  - **🐛 Bug:** เมื่ออัปโหลดรูป >700KB `compressImage()` คืนค่า `Blob` ซึ่งไม่มี `.name` → `file.name.split('.')` crash ด้วย `"undefined is not object (evaluating 'n.name.split')"`
  - **🔧 Fix:** เพิ่ม null-safe check `file.name ? file.name.split('.').pop() : 'jpg'` ใน `stores/profile.js:62`
  - เนื่องจาก `compressImage()` output เป็น JPEG เสมอ (`canvas.toBlob` ใช้ `'image/jpeg'`) จึง safe ที่จะ fallback เป็น `'jpg'`

---

## 🎯 Milestone 14 — Bug Fix: Avatar Upload ไม่ Overwrite รูปเก่า (v1.4.2)

**Est:** 0.1 day

### Tasks

- [x] **M14.1** วิเคราะห์สาเหตุ: `uploadAvatar()` ใช้ path `{userId}/avatar.{ext}` ซึ่ง `ext` มาจาก `file.name.split('.').pop()` ทำให้ path เปลี่ยนตามนามสกุลไฟล์ต้นทาง → `upsert: true` ไม่สามารถ overwrite รูปเก่าได้ เพราะ path ต่างกัน
- [x] **M14.2** แก้ `stores/profile.js`: เปลี่ยน path เป็น `{userId}/avatar` (ไม่มี extension) เพื่อให้ `upsert: true` overwrite ไฟล์เดิมได้ทุกครั้ง
- [x] **M14.3** ทดสอบ:
  - อัปโหลด PNG → path `{userId}/avatar` → อัปโหลด JPG ซ้ำ → path `{userId}/avatar` เดิม → overwrite สำเร็จ
  - อัปโหลดรูปใหญ่ (>700KB) → ถูก compress เป็น Blob → path `{userId}/avatar` → overwrite สำเร็จ
- [x] **M14.4** Bump version 1.4.2, อัปเดต docs

---

## 🎯 Milestone 15 — Bug Fix: Avatar Cache + iOS HEIC Support (v1.4.3)

**Est:** 0.3 day

### Tasks

- [x] **M15.1** 🐞 **Bug: Avatar ไม่ reload หลัง upload** (Browser Cache)
  - **สาเหตุ:** `uploadAvatar()` ใช้ path `{userId}/avatar` คงที่ + `upsert: true` → public URL ไม่เปลี่ยน → browser แสดงรูปเก่าที่ cached
  - **Fix:** เพิ่ม `?t=${Date.now()}` ต่อท้าย publicUrl ก่อน set `this.profile.avatar_url`
  - **Files:** `src/stores/profile.js` (บรรทัด ~76)

- [x] **M15.2** 🐞 **Bug: เลือกรูปจาก Album iOS ไม่ได้**
  - **สาเหตุ:** `<input accept="image/jpeg,image/png">` ไม่รวม `image/heic` / `image/heif` → iOS file picker กรอง HEIC photos ออก
  - **Fix:** เพิ่ม `image/heic,image/heif` ใน `accept` attribute
  - **Files:** `src/pages/ProfilePage.vue` (บรรทัด 198)

- [x] **M15.3** 🐞 **HEIC→JPEG conversion support**
  - **สาเหตุ:** แม้ iOS จะ allow HEIC file ได้ แต่ Supabase Storage bucket จำกัด MIME types + `<canvas>.toBlob` ไม่ support HEIC output
  - **Fix:** ใช้ `heic2any` library แปลง HEIC เป็น JPEG ก่อน upload
  - **Files:** `src/pages/ProfilePage.vue` (handleFileChange)
  - **Dependency:** `heic2any` (npm)

- [x] **M15.4** ทดสอบ:
  - อัปโหลดรูป → preview อัปเดตทันที (ไม่ค้างรูปเก่า)
  - อัปโหลด HEIC จาก iOS file picker → แปลงเป็น JPEG → upload สำเร็จ
  - อัปโหลด JPEG/PNG ปกติ → ยังทำงานเหมือนเดิม
  - Dashboard header avatar อัปเดตหลังจากกลับมาหน้า Dashboard

### Files to Modify

| File | Change |
|------|--------|
| `src/stores/profile.js` | เพิ่ม `?t=${Date.now()}` cache-busting หลัง `getPublicUrl` |
| `src/pages/ProfilePage.vue` | เพิ่ม `image/heic,image/heif` ใน `accept`; เพิ่ม HEIC→JPEG conversion |
| `package.json` | เพิ่ม `heic2any` dependency |

---

## 🎯 Milestone 18 — UI Redesign: Profile Page (v3.0.0)

**Est:** 1 day

### Tasks

- [ ] **M18.1** ProfilePage: ปรับ child info section เป็น table layout card
  - เปลี่ยน label "ชื่อลูก" → "ชื่อเล่น"
  - Icon + label ด้านซ้าย | value/input ด้านขวา (border-bottom divider)
  - Birthday: แสดงอายุใต้ input ด้วย text #0EA5E9/11px/600
- [ ] **M18.2** ProfilePage: gender selector → pill toggle
  - Selected: `bg #EFF6FF`, `border 1px #93C5FD`, `text #0284C7`, `border-radius 8px`
  - Unselected: `bg transparent`, `border 1px --color-border`
  - รูปแบบ: `👧 หญิง` / `👦 ชาย`
- [ ] **M18.3** ProfilePage: เพิ่ม stats section 2 คอลัมน์
  - ซ้าย: "📊 บันทึกเดือนนี้" bg `#F0FDF4`, text `#15803D`
  - ขวา: "🔥 ติดต่อกัน" bg `#EFF6FF`, text `#0369A1`
  - จำนวนวันแสดง 22px/800
- [ ] **M18.4** ProfilePage: streak calculation (ติดต่อกัน)
  - นับวันที่บันทึกติดต่อกันย้อนหลังจากปัจจุบัน
  - ขาด 1 วัน → reset
  - function ใน logs store หรือ computed ใน ProfilePage
- [ ] **M18.5** ProfilePage: เปลี่ยน logout button → danger outlined
  - `background: #fff`, `border: 1.5px solid #FCA5A5`, `color: #EF4444`
  - เพิ่ม style ใน button.css ถ้ายังไม่มี
- [ ] **M18.6** ProfilePage: avatar container — 52×52px, edit overlay (✏️)
  - คลิก avatar หรือ overlay → trigger file picker
  - รักษา upload flow เดิม (compress, HEIC→JPEG, Supabase Storage)
- [ ] **M18.7** ProfilePage: child info card border/shadow ตาม card pattern
  - `border-radius: --radius-xl`, `border: 1px solid --color-border-subtle`, `box-shadow: shadow-subtle`
- [ ] **M18.8** Bump version → 3.0.0
  - อัปเดต `package.json` version
  - Commit พร้อม tag `v3.0.0`

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/ProfilePage.vue` | Child info card layout, gender pill, stats section, logout style, avatar overlay |
| `src/styles/components/button.css` | Danger outlined variant (`.btn--danger-outlined`) |
| `src/stores/logs.js` | Streak calculation helper (ถ้าจำเป็น) |
| `package.json` | Bump version `3.0.0` |

---

## 🎯 Milestone 19 — Dark Mode (v4.0.0)

**Est:** 1.0 day

### Tasks

**M19.1 — Create `useDarkMode.js` composable**

- [ ] **M19.1.1** สร้าง `src/composables/useDarkMode.js`:
  - จัดการ `.dark` class บน `<html>` element
  - ตรวจจับ `prefers-color-scheme: dark` (system preference)
  - localStorage key `kidhealth-dark-mode`: `"on"` / `"off"`
  - Priority: manual toggle > system preference
  - อัปเดต `<meta name="theme-color">` ตาม mode

**Files:** `src/composables/useDarkMode.js`

**M19.2 — Tailwind v4 dark mode configuration**

- [ ] **M19.2.1** เพิ่ม `@custom-variant dark (&:where(.dark, .dark *));` ใน `src/style.css`
- [ ] **M19.2.2** เพิ่ม dark mode CSS custom properties ใน `src/styles/tokens.css`
- [ ] **M19.2.3** แก้ไข `index.html`: เพิ่ม `<meta name="color-scheme" content="light dark">`

**M19.3 — Update all components with dark: variants**

- [ ] **M19.3.1** DashboardPage.vue: `dark:` classes for bg, text, border, input
- [ ] **M19.3.2** SummaryPage.vue: `dark:` classes for calendar, legend, month picker
- [ ] **M19.3.3** ProfilePage.vue: `dark:` classes for profile card, child info, stats
- [ ] **M19.3.4** LoginPage.vue / RegisterPage.vue: `dark:` classes
- [ ] **M19.3.5** BottomNav.vue: `dark:` classes
- [ ] **M19.3.6** CalendarGrid.vue: no-data cell color `#F1F5F9` → `dark:bg-[#334155]`, today outline `ring-sky-500` → `dark:ring-sky-400`
- [ ] **M19.3.7** Legend.vue: `dark:text-slate-300`
- [ ] **M19.3.8** MonthPicker.vue: arrow text, disabled state
- [ ] **M19.3.9** SymptomCard.vue: unselected bg tint (keep same), text color
- [ ] **M19.3.10** ToastContainer.vue: inverted colors in dark mode
- [ ] **M19.3.11** GuestBanner.vue: `dark:bg-amber-900/30`, `dark:text-amber-200`
- [ ] **M19.3.12** Component CSS files: dark mode variants สำหรับ hardcoded colors

**M19.4 — Dark mode toggle UI**

- [ ] **M19.4.1** เพิ่ม toggle switch ใน ProfilePage (ใต้ stats section)
  - `role="switch"`, `aria-checked`, label "🌙 โหมดมืด"
  - custom toggle switch CSS
  - เชื่อมกับ `useDarkMode().isDark` และ `toggle()`

**Files:** `src/pages/ProfilePage.vue`

**M19.5 — Export PDF dark mode compatibility**

- [ ] **M19.5.1** แก้ `useExportPdf.js`:
  - บังคับ light mode ก่อน html2canvas capture (remove `.dark`)
  - restore class หลัง export

**Files:** `src/composables/useExportPdf.js`

**M19.6 — Verify**

- [ ] **M19.6.1** System dark mode → auto `.dark` class
- [ ] **M19.6.2** Manual toggle → localStorage persists
- [ ] **M19.6.3** Reload → preference stays
- [ ] **M19.6.4** Clear localStorage → fallback to system preference
- [ ] **M19.6.5** Symptom colors unchanged
- [ ] **M19.6.6** Export PDF → light mode result
- [ ] **M19.6.7** iOS Safari/PWA: dark mode works

### Files Modified

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

---

## 🎯 Milestone 20 — Forgot Password (v4.0.0)

**Est:** 0.5 day

### Tasks

**M20.1 — Auth Store: recovery state & actions**

- [ ] **M20.1.1** เพิ่ม `state.isPasswordRecovery` (bool, default false)
- [ ] **M20.1.2** เพิ่ม `action resetPassword(email)`:
  - เรียก `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`
- [ ] **M20.1.3** เพิ่ม `action updatePassword(password)`:
  - เรียก `supabase.auth.updateUser({ password })`
  - set `isPasswordRecovery = false` ถ้าสำเร็จ
- [ ] **M20.1.4** อัปเดต `onAuthStateChange` handler:
  - `PASSWORD_RECOVERY` → set `isPasswordRecovery = true`
  - `SIGNED_OUT` → set `isPasswordRecovery = false`

**Files:** `src/stores/auth.js`

**M20.2 — Create ForgotPasswordPage**

- [ ] **M20.2.1** สร้าง `src/pages/ForgotPasswordPage.vue`:
  - Layout: logo, คำอธิบาย, email input, submit button, "กลับไปหน้า Login"
  - onSubmit → `auth.resetPassword(email)` → on success แสดง success state
  - Security: **ไม่บอก** ว่า email มีในระบบหรือไม่ — แสดง success เสมอ
  - Error toast ถ้า API error
  - Loading state: "กำลังส่ง..."
  - ถ้า `auth.session` → redirect `/dashboard`
- [ ] **M20.2.2** ตรวจสอบ: `/forgot-password` ทำงานใน Guest mode ด้วย (ไม่มี session)

**Files:** `src/pages/ForgotPasswordPage.vue`

**M20.3 — Create ResetPasswordPage**

- [ ] **M20.3.1** สร้าง `src/pages/ResetPasswordPage.vue`:
  - ตรวจจับ recovery session: `auth.isPasswordRecovery === true`
  - ถ้าไม่มี recovery session → redirect `/forgot-password` + error toast "ลิงก์ไม่ถูกต้องหรือหมดอายุ"
  - Form: Password ใหม่ + Confirm Password
  - Validate: ≥ 8 ตัว, ตรงกัน
  - onSubmit → `auth.updatePassword(password)` → success toast → redirect `/login`
  - ถ้ามี session ปกติ → redirect `/dashboard`
  - แก้ไข meta title

**Files:** `src/pages/ResetPasswordPage.vue`

**M20.4 — Router: routes + guard**

- [ ] **M20.4.1** เพิ่ม route `/forgot-password` → ForgotPasswordPage
- [ ] **M20.4.2** เพิ่ม route `/reset-password` → ResetPasswordPage
- [ ] **M20.4.3** Guard: `if (/forgot-password && session) redirect /dashboard`
- [ ] **M20.4.4** ResetPasswordPage: ปล่อยผ่าน guard (ตรวจสอบ recovery ใน component)

**Files:** `src/router/index.js`

**M20.5 — Supabase Configuration**

- [ ] **M20.5.1** ตั้งค่า Redirect URLs: `${origin}/reset-password`
- [ ] **M20.5.2** ตรวจสอบ email template "Reset Password"
- [ ] **M20.5.3** ตรวจสอบว่า "Confirm email" เปิดอยู่

**M20.6 — Verify**

- [ ] **M20.6.1** Login page → link "ลืมรหัสผ่าน?" → `/forgot-password`
- [ ] **M20.6.2** กรอก email ที่สมัครไว้ → ส่งลิงก์ → success toast
- [ ] **M20.6.3** รับ email → คลิก link → `/reset-password` → form ตั้งรหัสผ่าน
- [ ] **M20.6.4** ตั้งรหัสผ่านใหม่ → success → redirect `/login` → login ด้วยรหัสใหม่
- [ ] **M20.6.5** recovery link หมดอายุ → error toast → redirect `/forgot-password`
- [ ] **M20.6.6** มี session อยู่แล้ว → redirect `/dashboard`
- [ ] **M20.6.7** กรอก email ที่ไม่มีในระบบ → success (security)
- [ ] **M20.6.8** Password validation: < 8 ตัว → error, ไม่ตรงกัน → error
- [ ] **M20.6.9** Network error → error toast + ให้ลองใหม่

### Files Modified

| File | Change |
|------|--------|
| `src/pages/ForgotPasswordPage.vue` | **New** |
| `src/pages/ResetPasswordPage.vue` | **New** |
| `src/router/index.js` | 2 routes + guard |
| `src/stores/auth.js` | `isPasswordRecovery`, `resetPassword()`, `updatePassword()` |
