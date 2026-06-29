# 📋 Requirements: KidHealth Tracker
> แอพติดตามอาการป่วยรายวันของลูก  
> Stack: Vue 3 · Supabase · Vercel

---

## 1. Overview

แอพพลิเคชันสำหรับผู้ปกครองในการบันทึกอาการป่วยรายวันของลูก แสดงผลสรุปเป็นสีรายเดือนเพื่อให้เห็นแนวโน้มสุขภาพได้ง่าย

---

## 2. Application Flow (Mermaid)

### 2.1 User Journey Overview

```mermaid
flowchart TD
    Start([เปิดแอพ]) --> CheckSession{มี Session?}
    CheckSession -- ใช่ --> Dashboard
    CheckSession -- ไม่มี --> AuthPage{เลือก}

    AuthPage --> Login[login]
    AuthPage --> Register[register]

    Register --> FillRegister[กรอก Email + Password]
    FillRegister --> VerifyEmail[ยืนยัน Email]
    VerifyEmail --> Dashboard

    Login --> FillLogin[กรอก Email + Password]
    FillLogin --> LoginOK{Login สำเร็จ?}
    LoginOK -- ใช่ --> Dashboard[dashboard]
    LoginOK -- ไม่ --> ErrLogin[แสดง Error]
    ErrLogin --> FillLogin

    Dashboard --> SelectDate[เลือกวันที่]
    SelectDate --> SelectSymptom[เลือกอาการ 1 ใน 5]
    SelectSymptom --> Save[กดบันทึก]
    Save --> SaveOK{Upsert สำเร็จ?}
    SaveOK -- ใช่ --> SuccessMsg[แสดงข้อความยืนยัน]
    SaveOK -- ไม่ --> ErrSave[แสดง Error]

    Dashboard --> GoSummary[summary]
    GoSummary --> PickMonth[เลือกเดือน/ปี]
    PickMonth --> ShowCalendar[แสดงปฏิทินสี]
    ShowCalendar --> ExportPDF[กด Export PDF]
    ExportPDF --> DownloadFile[ดาวน์โหลด PDF]

    Dashboard --> Logout[Logout]
    Logout --> Login
```

### 2.2 Auth Flow

> **สำคัญ:** `auth.init()` (getSession) ทำงาน **ก่อน** `app.use(router)` เพื่อให้ auth guard มี session state ที่ถูกต้องตั้งแต่ navigation ครั้งแรก  
> ถ้า router ถูกติดตั้งก่อน init → guard จะเห็น `loading: true` → ปล่อยผ่านทั้งหมด → user ไปถึง `/dashboard` โดยไม่ต้อง login

```mermaid
sequenceDiagram
    actor User
    participant Vue as Vue App
    participant Supabase as Supabase Auth

    User->>Vue: เปิดแอพ
    Vue->>Vue: auth.init() → getSession()
    Vue->>Supabase: getSession()
    alt มี session
        Supabase-->>Vue: session valid
        Vue->>Vue: ตั้งค่า session, loading = false
        Vue->>Vue: app.use(router) → เริ่ม navigation
        Note over Vue: guard เห็น session → allow
        Vue-->>User: redirect /dashboard
    else ไม่มี session
        Supabase-->>Vue: null
        Vue->>Vue: ตั้งค่า session=null, loading = false
        Vue->>Vue: app.use(router) → เริ่ม navigation
        Note over Vue: root / → redirect /login
        Vue-->>User: แสดงหน้า /login
    end

    User->>Vue: กรอก email + password
    Vue->>Supabase: signInWithPassword()
    alt สำเร็จ
        Supabase-->>Vue: session token
        Vue-->>User: redirect /dashboard
    else ผิดพลาด
        Supabase-->>Vue: AuthError
        Vue-->>User: แสดง error message
    end
```

### 2.3 Register Flow

> **หมายเหตุ:** ส่ง `emailRedirectTo` = `window.location.origin + /login` ใน `options` ของ `signUp()`  
> เพื่อให้หลังยืนยัน email แล้ว Supabase redirect ไปหน้า Login (ไม่ใช่ `localhost` ตามค่าเริ่มต้นของ SITE_URL)

```mermaid
sequenceDiagram
    actor User
    participant Vue as Vue App
    participant Supabase as Supabase Auth
    participant Email as Email Provider

    User->>Vue: กรอก email + password + confirm password
    Vue->>Vue: validate (password match, length, not empty)
    Vue->>Vue: สร้าง redirectTo = `${origin}/login`
    Vue->>Supabase: signUp({ email, password, options: { emailRedirectTo, data: { first_name, last_name } } })
    Supabase-->>Email: ส่ง confirmation email (link → domain/login)
    Supabase-->>Vue: { user, session: null }
    Vue-->>User: แสดง "กรุณายืนยัน email" + ปุ่มกลับหน้า Login

    User->>Email: คลิก link ยืนยัน
    Email->>Supabase: confirm token
    Note over User,Email: Supabase redirect → /login (ตาม emailRedirectTo)
    User->>Vue: กลับไปหน้า Login และกรอกรหัสผ่าน
    Vue->>Supabase: signInWithPassword()
    Supabase-->>Vue: session token
    Vue-->>User: redirect /dashboard
```

### 2.4 Daily Log Flow

```mermaid
sequenceDiagram
    actor User
    participant Vue as Vue App
    participant Supabase as Supabase DB

    User->>Vue: เปิด /dashboard
    Vue->>Supabase: SELECT log_date=today
    alt มีข้อมูลแล้ว
        Supabase-->>Vue: existing record
        Vue-->>User: แสดงอาการที่เคยบันทึก (โหมดแก้ไข)
    else ยังไม่มี
        Supabase-->>Vue: null
        Vue-->>User: แสดงหน้าว่าง (โหมดสร้างใหม่)
    end

    User->>Vue: เลือกอาการ → กดบันทึก
    Vue->>Supabase: UPSERT (user_id, log_date, symptom)
    Supabase-->>Vue: success
    Vue-->>User: แสดง toast "บันทึกแล้ว ✓"
```

### 2.5 Export PDF Flow

```mermaid
flowchart LR
    A[กด Export PDF] --> B[โหลดข้อมูลเดือนนั้น]
    B --> C[Render ปฏิทินใน hidden div]
    C --> D[html2canvas → canvas]
    D --> E[jsPDF → แปลงเป็น PDF]
    E --> F[Download: kidhealth-YYYY-MM.pdf]
```

---

## 3. Color System (สีแทนอาการ)

| สี | Hex | อาการ | ชื่อรหัส |
|---|---|---|---|
| 🟢 เขียว | `#4CAF50` | ปกติ | `NORMAL` |
| 🔵 ฟ้า | `#2196F3` | มีน้ำมูกใส | `RUNNY_CLEAR` |
| 🟠 ส้ม | `#FF9800` | มีไข้ | `FEVER` |
| 🔴 แดง | `#F44336` | มีไข้ + น้ำมูกใส | `FEVER_RUNNY_CLEAR` |
| 🟤 น้ำตาล | `#78716C` | มีไข้ + น้ำมูกเขียว | `FEVER_RUNNY_GREEN` |
| 🟢 เขียวมะนาว | `#84CC16` | น้ำมูกเขียว | `RUNNY_GREEN` |

---

## 4. Screens

### 4.1 หน้า Register

**Path:** `/register`

**Elements:**
- Input: ชื่อจริง (First Name)
- Input: นามสกุล (Last Name)
- Input: Email
- Input: Password (masked, min 8 ตัว)
- Input: Confirm Password
- ปุ่ม "สมัครสมาชิก"
- Link กลับไปหน้า Login
- หน้าแจ้ง "กรุณายืนยัน email" หลังสมัครสำเร็จ

**Business Rules:**
- ใช้ Supabase Auth `signUp()`
- ส่ง first_name + last_name ไปใน `options.data` (user_metadata) ตอน signUp
- Supabase ส่ง confirmation email อัตโนมัติ (ต้องเปิด "Confirm email" ใน Supabase Dashboard)
- password ต้อง match และยาว ≥ 8 ตัว ก่อน call API
- ส่ง `options.emailRedirectTo = ${window.location.origin}/login` เพื่อให้ link ยืนยัน redirect ไปหน้า Login (ป้องกันการ redirect ไป `localhost` ผิดพลาด)
- หลังยืนยัน email แล้ว user ต้องกลับมาที่ Login และกรอกรหัสผ่านเพื่อเข้าสู่ระบบ
- หลัง login ครั้งแรก ระบบจะสร้าง record ในตาราง `profiles` อัตโนมัติ (ถ้ายังไม่มี) โดยดึง first_name, last_name จาก user_metadata

---

### 4.2 หน้า Login

**Path:** `/login`

**Elements:**
- Logo / ชื่อแอพ
- Input: Email
- Input: Password (masked)
- ปุ่ม "เข้าสู่ระบบ"
- Link ไป `/register`
- ข้อความ Error กรณี credential ผิด

**Business Rules:**
- ใช้ Supabase Auth `signInWithPassword()`
- เมื่อ login สำเร็จ redirect ไป `/dashboard`
- ถ้า session ยังอยู่ให้ข้าม login ไปเลย

---

### 4.3 หน้าบันทึกอาการ (Daily Log)

**Path:** `/dashboard`

**Elements:**
- Header: ชื่อแอพ + ปุ่ม Logout
- วันที่ปัจจุบัน (แก้ไขได้ ไม่เกินวันนี้)
- ปุ่มเลือกอาการ 6 ปุ่ม แสดงเป็นสีตาม Color System
- ปุ่ม "บันทึก"
- ข้อความยืนยันเมื่อบันทึกสำเร็จ
- Link ไปหน้า Summary

**ปุ่มอาการ (แสดงเป็น Card สี):**
```
[ 🟢 ปกติ ]          [ 🔵 น้ำมูกใส ]
[ 🟠 มีไข้ ]         [ 🔴 มีไข้ + น้ำมูกใส ]
[ 🤢 น้ำมูกเขียว ]    [ 🟤 มีไข้ + น้ำมูกเขียว ]
```

**Business Rules:**
- 1 วัน บันทึกได้ 1 ครั้ง (ถ้ามีข้อมูลแล้วให้โหลดมาแสดงและอนุญาตให้แก้ไขได้)
- วันที่เลือกต้องไม่เกินวันปัจจุบัน
- ต้องเลือกอาการก่อนถึงจะกดบันทึกได้

---

### 4.4 หน้า Summary รายเดือน

**Path:** `/summary`

**Elements:**
- Header: ชื่อแอพ + ปุ่ม Logout
- ตัวเลือกเดือน/ปี (← →)
- ปฏิทิน Grid (7 คอลัมน์ จ–อา)
  - แต่ละช่องวันแสดงเป็น **สีพื้นหลัง** ตาม Color System
  - วันที่ไม่มีข้อมูล = สีเทาอ่อน `#EEEEEE`
  - วันอนาคต = ว่างเปล่า / disabled
- Legend แสดงความหมายสีทั้ง 5
- นับจำนวนวันแต่ละสถานะด้านล่าง Legend
- ปุ่ม **"Export PDF"**
- Link กลับหน้า Dashboard

**Business Rules:**
- โหลดข้อมูลทั้งเดือนครั้งเดียวจาก Supabase
- Export PDF ใช้ `html2canvas` + `jsPDF` render ปฏิทินตรงๆ
- ไฟล์ที่ได้ชื่อ `kidhealth-YYYY-MM.pdf`

---

### 4.5 หน้าโปรไฟล์

**Path:** `/profile`

**Elements:**
- Header: eyebrow "โปรไฟล์" + heading "บัญชีของคุณ"
- Profile card (gradient header):
  - Avatar (รูป upload หรือ 👩 fallback)
  - ปุ่มเปลี่ยนรูปโปรไฟล์ (ถ่ายรูป / เลือกจากคลัง)
  - ชื่อ-นามสกุล (จาก profiles.first_name + profiles.last_name)
  - Email
- Profile body:
- แก้ไขชื่อลูก (child_name) → text input
- แก้ไขวันเกิดลูก (child_birthday) → date input (:max = วันนี้)
- เลือกเพศลูก (child_gender) → toggle button 👦 ชาย / 👧 หญิง
- แสดงอายุลูก คำนวณจาก child_birthday อัตโนมัติ (เช่น "อายุ 2 ปี 3 เดือน 5 วัน")
  - แสดงจำนวนวันที่บันทึก (เดือนนี้)
- ปุ่ม "บันทึก" สำหรับ child_name / child_birthday
- ปุ่ม "ออกจากระบบ" (สีแดง)

**Business Rules:**
- โหลด profile จากตาราง `profiles` ตาม `user_id`
- ถ้ายังไม่มี profile → สร้าง record ใหม่จาก user_metadata ตอน signUp
- child_name, child_birthday และ child_gender สามารถแก้ไขได้ตลอด
- child_birthday → อายุจะอัปเดตอัตโนมัติที่ frontend (คำนวณจากวันที่ปัจจุบัน เทียบกับ child_birthday)
- แสดงอายุเป็น "X ปี Y เดือน Z วัน" หรือ "X ปี Y เดือน" หรือ "X เดือน" (ถ้าอายุ < 2 ปี) หรือ "X วัน" (ถ้าอายุ < 1 เดือน)

**Avatar Upload (v1.4.0):**
- ผู้ใช้สามารถอัปโหลดรูปโปรไฟล์ได้จากหน้า Profile (คลิกที่ avatar หรือปุ่มเปลี่ยนรูป)
- รูปจะถูกอัปโหลดไปยัง Supabase Storage bucket `avatars`
- Path ใน Storage: `{user_id}/avatar` (ไม่มี extension — path คงที่เสมอ เพื่อให้ `upsert: true` overwrite ไฟล์เดิมได้ทุกครั้ง)
- Client-side auto-compress: ถ้าไฟล์ >700KB จะลด quality + resize ผ่าน `<canvas>` จนไฟล์ ≤700KB
- รองรับไฟล์ .jpg, .jpeg, .png (file picker จำกัด) แต่ output เป็น JPEG เสมอ
- หลัง upload สำเร็จ `avatar_url` ในตาราง `profiles` จะถูกอัปเดต
- Header Dashboard แสดง avatar ที่ upload แทน icon emoji (ถ้ามี) หรือ fallback เป็น 👶/👦/👧 ตาม child_gender
- หน้า Profile แสดง avatar ที่ upload ใน profile card แทน 👩 hardcoded

---

## 5. Profile Feature — Data Model

### Table: `profiles`

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK) | ใช้ `auth.uid()` เหมือน `user_id` (1:1 กับ auth.users) |
| `first_name` | `text` | ชื่อจริง (จากตอนสมัคร) |
| `last_name` | `text` | นามสกุล (จากตอนสมัคร) |
| `child_name` | `text` | ชื่อลูก (แก้ไขที่หน้า Profile) |
| `child_birthday` | `date` | วันเกิดลูก (แก้ไขที่หน้า Profile, nullable) |
| `child_gender` | `text` | เพศลูก ('male'/'female', nullable) — ใช้กำหนด icon ที่ header dashboard |
| `avatar_url` | `text` | URL รูปโปรไฟล์ใน Supabase Storage (nullable, v1.4.0) |
| `created_at` | `timestamptz` | เวลาสร้าง |
| `updated_at` | `timestamptz` | เวลาแก้ไขล่าสุด |

**Constraints:**
- `PRIMARY KEY (id)` — 1 user มี 1 profile เท่านั้น
- `FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE`

### Row Level Security (RLS):

```sql
-- User เห็นและแก้ไขได้เฉพาะ profile ตัวเอง
CREATE POLICY "Users can manage own profile"
  ON profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Profile Creation Flow

1. ตอน SignUp: ส่ง `first_name`, `last_name` ใน `options.data` (user_metadata)
2. ตอน Login ครั้งแรก / หน้า Profile mount: ถ้า `profiles` ยังไม่มี record → สร้าง record ใหม่จาก user_metadata
3. ถ้ามี record แล้ว → โหลดมาแสดงและแก้ไขได้

---

## 6. Export PDF

### Library

```bash
npm install jspdf html2canvas
```

### Implementation Pattern

```js
// src/composables/useExportPdf.js
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export function useExportPdf() {
  async function exportCalendar(elementRef, yearMonth) {
    const canvas = await html2canvas(elementRef.value, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const imgHeight = (canvas.height * pageWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 10, pageWidth, imgHeight)
    pdf.save(`kidhealth-${yearMonth}.pdf`)
  }

  return { exportCalendar }
}
```

### v1.3.0 Bug Fix: ปรับภาพ PDF ให้พอดีในหน้าเดียว

**ปัญหา:** ในบางเดือนที่มี 5–6 สัปดาห์ + Legend จำนวน 7 รายการ ภาพรวมของปฏิทิน + Legend เมื่อ capture ด้วย html2canvas scale 2 แล้วมีสัดส่วนสูงเกินกว่าหน้ากระดาษ A4 (portrait) ทำให้เนื้อหาตกไปหน้า 2

**สาเหตุ:**
- หน้า A4 portrait มีพื้นที่ใช้สอยประมาณ 190×277 มม. (หลังหัก margin 10 มม. × 2)
- เนื้อหาปฏิทิน (CalendarGrid + Legend) เมื่อ scaled เป็น 190 มม. กว้าง อาจสูงเกิน 277 มม.
- โค้ดปัจจุบันใช้ `addImage` พร้อม pagination loop → ตกหน้า 2

**แนวทางแก้ไข:**

```js
// ปรับให้ scale ภาพให้พอดีในหน้าเดียว
// ถ้าความสูงเกิน ให้ลดสัดส่วนเพื่อให้ทุกอย่างอยู่ในหน้า A4 portrait
async function exportCalendar(element, yearMonth) {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
  })
  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const maxWidth = pageWidth - margin * 2
  const maxHeight = pageHeight - margin * 2

  let imgWidth = maxWidth
  let imgHeight = (canvas.height * imgWidth) / canvas.width

  // ถ้าสูงเกิน → scale proportionally เพื่อให้พอดีในหน้าเดียว
  if (imgHeight > maxHeight) {
    imgHeight = maxHeight
    imgWidth = (canvas.width * imgHeight) / canvas.height
  }

  // จัดกึ่งกลางในแนวนอน
  const xOffset = (pageWidth - imgWidth) / 2
  pdf.addImage(imgData, 'PNG', xOffset, margin, imgWidth, imgHeight)
  pdf.save(`kidhealth-${yearMonth}.pdf`)
}
```

**ผลลัพธ์:** เนื้อหาปฏิทิน + Legend จะถูกลดขนาดตามสัดส่วนเพื่อให้พอดีใน A4 portrait หน้าเดียว ไม่มีการตัดหน้า 2 อีก

---

## 7. Data Model (Supabase)

### Table: `daily_logs`

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK) | Auto-generated |
| `user_id` | `uuid` (FK → auth.users) | เจ้าของข้อมูล |
| `log_date` | `date` | วันที่บันทึก |
| `symptom` | `text` | รหัสอาการ (NORMAL / FEVER / ...) |
| `created_at` | `timestamptz` | เวลาสร้าง |
| `updated_at` | `timestamptz` | เวลาแก้ไขล่าสุด |

**Constraints:**
- `UNIQUE (user_id, log_date)` — 1 วันต่อ 1 user มีได้ 1 แถว
- `CHECK symptom IN ('NORMAL','RUNNY_CLEAR','FEVER','FEVER_RUNNY_CLEAR','RUNNY_GREEN','FEVER_RUNNY_GREEN')`

### Table: `profiles`

(ดูรายละเอียดที่ Section 5 ด้านบน)

### Row Level Security (RLS):

```sql
-- User เห็นและแก้ไขได้เฉพาะข้อมูลตัวเอง
CREATE POLICY "Users can manage own logs"
  ON daily_logs
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 8. Supabase Storage — Avatar Upload (v1.4.0)

### Bucket: `avatars`

สร้าง bucket ชื่อ `avatars` ใน Supabase Storage Dashboard (Public bucket)

**Bucket Config:**
- Name: `avatars`
- Public: ✅ (allow public access to read)
- File size limit: 2MB
- Allowed MIME types: `image/jpeg`, `image/png`

### RLS Policy สำหรับ Storage

```sql
-- ให้ user อัปโหลดรูปตัวเอง
CREATE POLICY "Users can upload own avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ให้ user อ่านรูปตัวเอง (และ public อ่านได้เพราะ bucket เป็น public)
CREATE POLICY "Users can read own avatars"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ให้ user อัปเดตรูปตัวเอง
CREATE POLICY "Users can update own avatars"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ให้ user ลบรูปตัวเอง
CREATE POLICY "Users can delete own avatars"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

### Upload Flow

```
User คลิก avatar / ปุ่มเปลี่ยนรูป
  → เปิด file picker (accept="image/jpeg,image/png")
  → validate ขนาด ≤ 2MB
  → crop เป็น 1:1 (ใช้ canvas/css)
  → upload ไปที่ storage/avatars/{user_id}/avatar (path คงที่, upsert: true)
  → ได้ public URL กลับมา
  → อัปเดต profiles.avatar_url
  → Header Dashboard + Profile card แสดงรูปใหม่
```

### Public URL Pattern

```
https://{project_id}.supabase.co/storage/v1/object/public/avatars/{user_id}/{filename}
```

## 9. Environment Strategy

### แนวคิดหลัก

ใช้ **Supabase Project แยกกัน 2 project** สำหรับ dev และ prod  
เพราะ Supabase project แต่ละอันมี URL + Key ของตัวเอง และ database แยกขาดจากกัน

```
dev project  → kidhealth-dev.supabase.co   (ทดสอบ, ข้อมูลทดสอบ)
prod project → kidhealth-prod.supabase.co  (ข้อมูลจริง)
```

---

### ไฟล์ env ในโปรเจกต์

```
project-root/
├── .env                  # ค่า default (ไม่ควร commit ถ้ามี secret)
├── .env.development      # ใช้ตอน npm run dev
├── .env.production       # ใช้ตอน npm run build (Vercel ใช้อันนี้)
└── .env.local            # override ส่วนตัว ไม่ commit (gitignore)
```

**.env.development**
```env
VITE_SUPABASE_URL=https://kidhealth-dev.supabase.co
VITE_SUPABASE_ANON_KEY=eyJdev...
VITE_APP_ENV=development
```

**.env.production**
```env
VITE_SUPABASE_URL=https://kidhealth-prod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJprod...
VITE_APP_ENV=production
```

> ⚠️ **ห้าม commit `.env.production`** → ใส่ค่าจริงใน Vercel Dashboard แทน

---

### Vercel Environment Variables

ตั้งค่าใน Vercel Dashboard → Project → Settings → Environment Variables

| Variable | Environment | Value |
|---|---|---|
| `VITE_SUPABASE_URL` | Production | `https://kidhealth-prod.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Production | `eyJprod...` |
| `VITE_SUPABASE_URL` | Preview | `https://kidhealth-dev.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Preview | `eyJdev...` |
| `VITE_SUPABASE_URL` | Development | `https://kidhealth-dev.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Development | `eyJdev...` |

> Vercel มี 3 environment: **Production** (main branch), **Preview** (PR branch), **Development** (local pull via `vercel env pull`)

---

### .gitignore

```
.env.local
.env.production   # ถ้าใส่ค่า secret จริงไว้
```

---

### สรุป: ใช้ env ไฟล์ไหนเมื่อไหร่

| สถานการณ์ | ไฟล์ที่ Vite ใช้ | ชี้ไป Supabase |
|---|---|---|
| `npm run dev` | `.env.development` | dev project |
| `npm run build` (local) | `.env.production` | prod project |
| Vercel deploy (main) | Vercel Env: Production | prod project |
| Vercel deploy (PR) | Vercel Env: Preview | dev project |
| `vercel env pull` | `.env.local` (auto-generated) | ตาม Vercel setting |

---

## 10. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 (Composition API) + Vite |
| UI | Tailwind CSS |
| State | Pinia |
| Backend / Auth / DB | Supabase (Auth + PostgreSQL) |
| Hosting | Vercel |
| Router | Vue Router 5 |
| PDF Export | jsPDF + html2canvas |
| PWA | vite-plugin-pwa (Workbox) |

---

## 11. Project Structure

```
public/
├── favicon.svg                # favicon
├── icons.svg                  # social icon sprite
└── pwa-icon.svg               # PWA home screen icon (512×512 SVG)
src/
├── assets/
├── components/
│   ├── BottomNav.vue          # Bottom navigation (Dashboard / Summary / Profile)
│   ├── CalendarGrid.vue       # ปฏิทิน summary (ref สำหรับ export)
│   ├── Legend.vue             # Legend + นับจำนวนวัน
│   ├── MonthPicker.vue        # ตัวเลื่อนเดือน
│   ├── SymptomCard.vue        # ปุ่มเลือกอาการ (รับ color + label)
│   └── ToastContainer.vue     # Toast แจ้งเตือน
├── composables/
│   ├── useExportPdf.js        # html2canvas + jsPDF
│   └── useToast.js            # Global toast state
├── constants/
│   └── symptoms.js            # Color map + label
├── lib/
│   └── supabase.js            # Supabase client
├── pages/
│   ├── LoginPage.vue
│   ├── RegisterPage.vue
│   ├── VerifyEmailPage.vue    # หน้ารอ confirm email
│   ├── DashboardPage.vue
│   ├── SummaryPage.vue
│   └── ProfilePage.vue        # โปรไฟล์ + แก้ไขชื่อ/วันเกิดลูก
├── router/
│   └── index.js               # Vue Router + auth guard
├── stores/
│   ├── auth.js                # Pinia: session, user, loading
│   ├── logs.js                # Pinia: daily logs CRUD
│   └── profile.js             # Pinia: profile (child_name, child_birthday)
├── styles/
│   ├── tokens.css             # Design tokens (colors, spacing, shadows)
│   ├── typography.css         # Font sizes, weights, heading classes
│   ├── base.css               # Reset, body, scroll, focus styles
│   └── components/            # Component-level CSS
│       ├── button.css
│       ├── input.css
│       ├── symptom-card.css
│       ├── calendar.css
│       ├── bottom-nav.css
│       └── toast.css
├── App.vue
├── main.js
└── style.css                  # @import entry for all CSS
```

---

## 12. Routes & Auth Guard

| Path | Component | Auth Required | Notes |
|---|---|---|---|
| `/login` | LoginPage | ❌ | |
| `/register` | RegisterPage | ❌ | |
| `/verify` | VerifyEmailPage | ❌ | หลังสมัคร, แสดง "กรุณาตรวจสอบอีเมล" |
| `/` | — | — | redirect → `/login` |
| `/dashboard` | DashboardPage | ✅ | |
| `/summary` | SummaryPage | ✅ | |
| `/profile` | ProfilePage | ✅ | |
| `/:pathMatch(.*)*` | — | — | catch-all redirect → `/login` |

### Auth Guard Logic (`router.beforeEach`)

```js
if (auth.loading) return                    // ← ไม่ redirect (loading splash)
if (to.meta.requiresAuth && !auth.session) return '/login'
if (to.path === '/login' && auth.session) return '/dashboard'
if (to.path === '/register' && auth.session) return '/dashboard'
```

### Init Order (สำคัญ!)

```js
// main.js — bootstrap
app.use(pinia)
await useAuthStore().init()     // 1. auth init ก่อน
app.use(router)                 // 2. router navigation หลัง auth init
app.mount('#app')
```

> **เหตุผล:** `app.use(router)` เริ่ม navigation ทันที ถ้า `init()` ยังไม่เสร็จ → `loading = true` → guard ปล่อยผ่านทั้งหมด → user ถึง Dashboard โดยไม่ต้อง login  
> แก้โดยย้าย `app.use(router)` ไว้หลัง `await useAuthStore().init()`

---

## 13. Constants: Symptom Map

```js
// src/constants/symptoms.js
export const SYMPTOMS = [
  { code: 'NORMAL',            label: 'ปกติ',                color: '#22C55E' },
  { code: 'RUNNY_CLEAR',       label: 'น้ำมูกใส',            color: '#3B82F6' },
  { code: 'FEVER',             label: 'มีไข้',               color: '#F97316' },
  { code: 'FEVER_RUNNY_CLEAR', label: 'ไข้ + น้ำมูกใส',     color: '#EF4444' },
  { code: 'RUNNY_GREEN',       label: 'น้ำมูกเขียว',          color: '#84CC16' },
  { code: 'FEVER_RUNNY_GREEN', label: 'ไข้ + น้ำมูกเขียว',   color: '#78716C' },
]
```

---

## 14. PWA — Progressive Web App

แอพรองรับการติดตั้งบน Home Screen ของมือถือ (Add to Home Screen)  
ผ่าน **manifest.json** + **Service Worker (Workbox)** ที่สร้างโดย `vite-plugin-pwa`

### คุณสมบัติ

| Feature | รายละเอียด |
|---|---|
| Manifest | name: `KidHealth Tracker`, short_name: `KidHealth`, display: `standalone` |
| Start URL | `/dashboard` (หลังจาก login) |
| Theme Color | `#F8FAFC` |
| Icon | SVG 512×512 + PNG 192×192 + PNG 512×512 (purple heart on white bg) |
| Service Worker | auto-generated by `vite-plugin-pwa` |
| Caching | App shell (JS, CSS, HTML) + Google Fonts (CacheFirst) |
| iOS Meta | `apple-mobile-web-app-capable`, `apple-touch-icon` |

### ไฟล์ที่เกี่ยวข้อง

| File | Role |
|---|---|
| `public/pwa-icon-v2.svg` | 512×512 SVG icon สำหรับ manifest |
| `public/pwa-icon-192.png` | 192×192 PNG icon (fallback สำหรับ Android) |
| `public/pwa-icon-512.png` | 512×512 PNG icon (fallback สำหรับ Android) |
| `vite.config.js` | `VitePWA` plugin config (manifest + Workbox) |
| `index.html` | `<link rel="manifest">`, `<meta>` tags for iOS/Android |

> Browser จะแสดง banner "Add to Home Screen" เมื่อตรงเงื่อนไข: HTTPS, manifest.json valid, service worker registered, มี icon 192px+

---

## 15. Out of Scope (v1)

- ❌ รองรับหลายโปรไฟล์เด็ก
- ❌ Push notification
- ❌ Export CSV (ทำได้ทาง PDF เท่านั้น)
- ❌ Dark mode
- ❌ Forgot password (ทำได้ผ่าน Supabase default แต่ไม่ได้ design หน้า UI)
