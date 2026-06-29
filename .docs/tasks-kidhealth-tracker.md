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
├── .env.development          # dev keys
├── .env.production           # prod keys (gitignored)
├── .env.local                # override (gitignored)
├── .gitignore
├── index.html                # PWA meta tags + manifest link
├── package.json
├── vite.config.js            # Vue + Tailwind + VitePWA plugins
├── vercel.json               # SPA fallback
├── public/
│   ├── favicon-v2.svg
│   ├── pwa-icon-v2.svg       # PWA home screen icon (SVG)
│   ├── pwa-icon-192.png      # PWA icon 192×192 PNG
│   └── pwa-icon-512.png      # PWA icon 512×512 PNG
└── src/
    ├── main.js               # bootstrap: auth.init() → router → mount
    ├── App.vue               # loading splash + router-view + BottomNav
    ├── style.css             # CSS entry
    ├── lib/
    │   └── supabase.js
    ├── router/
    │   └── index.js          # routes + auth guard beforeEach
    ├── stores/
    │   ├── auth.js
    │   ├── logs.js
    │   └── profile.js
    ├── pages/
    │   ├── LoginPage.vue
    │   ├── RegisterPage.vue
    │   ├── VerifyEmailPage.vue
    │   ├── DashboardPage.vue
    │   ├── SummaryPage.vue
    │   └── ProfilePage.vue
    ├── components/
    │   ├── BottomNav.vue
    │   ├── CalendarGrid.vue
    │   ├── Legend.vue
    │   ├── MonthPicker.vue
    │   ├── SymptomCard.vue
    │   └── ToastContainer.vue
    ├── composables/
    │   ├── useExportPdf.js
    │   └── useToast.js
    ├── constants/
    │   └── symptoms.js
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
- [ ] **M8.9** 🐞 Bug: iOS Add to Home Screen Icon ไม่ขึ้น — ดูรายละเอียดด้านล่าง

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
- [ ] **M9.2** Import project in Vercel
- [ ] **M9.3** Set Environment Variables (Production = prod, Preview = dev)
- [ ] **M9.4** Configure Production branch = `main`
- [ ] **M9.5** Test: Production URL → prod Supabase / Preview URL → dev Supabase
- [x] **M9.6** `vercel.json` (SPA fallback) — สร้างแล้ว

---

## 🎯 Milestone 10 — QA / UAT

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
- [ ] **T17** Open root `/` when not logged in → redirect `/login` (not Dashboard)
- [ ] **T18** Register → receive email → click link → redirect `/login` (not localhost)
- [ ] **T19** PWA: Chrome DevTools → Manifest valid, Service Worker registered
- [ ] **T20** PWA: iOS Safari → "Add to Home Screen" shows app icon + name
- [ ] **T21** เลือกเพศลูก (ชาย/หญิง) → header dashboard แสดง icon ตรงเพศ
- [ ] **T22** บันทึกวันในอนาคต → แสดง error "ไม่สามารถบันทึกวันในอนาคตได้"
- [ ] **T23** PWA manifest ต้อง valid (manifest.webmanifest มี PNG + SVG icons)

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

---
 
## 🎯 Milestone 10 — Post-Launch Improvements (v1.2.0)
 
**Est:** 0.5 day
 
### Tasks
 
- [x] **M10.1** เพิ่ม greeting "พ่อแม่น้อง{ชื่อลูก}" แทน "คุณพ่อคุณแม่ของ{ชื่อลูก}"
- [x] **M10.2** เพิ่ม child_gender field + gender selector ใน ProfilePage
- [x] **M10.3** แสดง icon เด็กผู้ชาย/ผู้หญิงที่ header dashboard ตาม child_gender
- [x] **M10.4** แก้ไข: `today` เป็น computed ref ป้องกันค่าเก่าค้าง
- [x] **M10.5** แก้ไข: เพิ่ม `date > today` validation ใน logs store (ป้องกันบันทึกวันอนาคต)
- [x] **M10.6** แก้ไข: PWA manifest filename (manifest.json → manifest.webmanifest)
- [x] **M10.7** เพิ่ม PNG icons (192×192 + 512×512) สำหรับ PWA compatibility
- [x] **M10.8** เปลี่ยน T00:00:00 → T12:00:00 ป้องกัน timezone edge case
- [x] **M10.9** เพิ่ม `:max="today"` ใน birthday input ของ ProfilePage
- [x] **M10.10** Bump version 1.2.0, อัปเดต docs ทั้งหมด

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
