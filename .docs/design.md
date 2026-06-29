# 🎨 Design System: KidHealth Tracker

> เอกสาร Design ครอบคลุม Token, Component, Layout, Copy, และ Motion
> ใช้คู่กับ `requirements-kidhealth-tracker.md`

---

## 1. Design Direction

**Product:** แอพติดตามอาการลูกรายวัน สำหรับผู้ปกครอง  
**Primary audience:** คุณพ่อคุณแม่วัย 25–40 ปี ใช้บนมือถือขณะดูแลลูก  
**Single job of the UI:** บันทึกอาการในเวลา < 10 วินาที และอ่านแนวโน้มได้ทันที

**Aesthetic direction:** _Calm clinical_ — สะอาด อ่านง่าย ให้ความรู้สึกเชื่อถือได้เหมือนแอพสุขภาพ แต่อบอุ่นพอที่จะไม่น่ากลัว ไม่ใช้ลวดลาย ไม่ใช้ gradient หนักๆ ความโดดเด่นทั้งหมดอยู่ที่ **ระบบสีอาการ** ที่เป็น signature ของแอพนี้โดยเฉพาะ

**Signature element:** Symptom Color Card — ปุ่มเลือกอาการเป็น pill card ที่ใช้สีเป็น primary language แทนข้อความ เมื่อเลือกแล้ว card จะ "ดูด" ตัวเองลงเล็กน้อย (scale 0.97) พร้อม colored shadow เพื่อยืนยัน selection อย่างชัดเจน

---

## 2. Color Tokens

### 2.1 Base Palette

| Token | Hex | ใช้งาน |
|---|---|---|
| `--color-bg` | `#F8FAFC` | พื้นหลัง app |
| `--color-surface` | `#FFFFFF` | card, modal, nav |
| `--color-border` | `#E2E8F0` | เส้นขอบทั่วไป |
| `--color-border-subtle` | `#F1F5F9` | เส้นแบ่งภายใน card |
| `--color-text-primary` | `#0F172A` | heading, label สำคัญ |
| `--color-text-secondary` | `#475569` | body text |
| `--color-text-muted` | `#94A3B8` | placeholder, caption |
| `--color-primary` | `#0EA5E9` | CTA หลัก, active nav, focus ring |
| `--color-primary-dark` | `#0284C7` | hover state ของ primary |
| `--color-danger` | `#EF4444` | error message, logout |
| `--color-export` | `#7C3AED` | ปุ่ม Export PDF เท่านั้น |

### 2.2 Symptom Color System

สีเหล่านี้คือ core identity ของแอพ ต้องใช้สม่ำเสมอทุก surface

| Token | Hex | bg tint | border | อาการ |
|---|---|---|---|---|
| `--symptom-normal` | `#22C55E` | `#F0FDF4` | `#86EFAC` | ปกติ |
| `--symptom-runny-clear` | `#3B82F6` | `#EFF6FF` | `#93C5FD` | น้ำมูกใส |
| `--symptom-fever` | `#F97316` | `#FFF7ED` | `#FED7AA` | มีไข้ |
| `--symptom-fever-runny-clear` | `#EF4444` | `#FEF2F2` | `#FCA5A5` | ไข้ + น้ำมูกใส |
| `--symptom-runny-green` | `#84CC16` | `#F7FEE7` | `#BEF264` | น้ำมูกเขียว |
| `--symptom-fever-runny-green` | `#78716C` | `#FAFAF9` | `#D6D3D1` | ไข้ + น้ำมูกเขียว |
| `--symptom-no-data` | `#F1F5F9` | — | — | ไม่มีข้อมูล |

**กฎการใช้สี symptom:**
- ช่องปฏิทินที่ไม่มีข้อมูล → `--symptom-no-data`
- ช่องปฏิทินที่มีข้อมูล → `background: --symptom-*` (solid, ไม่ใช้ tint)
- Symptom Card (unselected) → `background: tint`, `border: border token`
- Symptom Card (selected) → `background: solid color`, `color: #fff`, `box-shadow: 0 4px 14px {color}40`
- Text บน solid symptom color → `#FFFFFF` เสมอ

---

## 3. Typography

| Role | Typeface | Weight | Size | ใช้งาน |
|---|---|---|---|---|
| Display | Sarabun | 800 | 22–26px | Page title, hero heading |
| Body | Sarabun | 400–600 | 13–15px | ข้อความทั่วไป, label, input |
| Caption | Sarabun | 600–700 | 11–12px | eyebrow label, legend, date header |
| Data | Sarabun | 700 | 13–16px | ตัวเลข stat, วันที่ปฏิทิน |

**Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet">
```

**Type Scale:**

```
26px / 800 — Page heading (Login title)
22px / 800 — Section heading (Dashboard, Summary)
16px / 800 — Card heading, Month label
15px / 600 — Input text, button label
14px / 400 — Body, description
13px / 700 — Symptom label, stat value
12px / 700 — Eyebrow label (ALL CAPS + letter-spacing: 1px)
11px / 500 — Calendar date number, legend caption
```

**Eyebrow pattern:** label เล็กเหนือ heading ใหญ่ ใช้ `12px / 700 / uppercase / letter-spacing: 1px / color: --text-muted`

```
บันทึกอาการ          ← eyebrow
สวัสดี คุณแม่ 👋     ← display heading
```

---

## 4. Spacing & Radius

### Spacing Scale (base 4px)

| Token | Value | ใช้งาน |
|---|---|---|
| `--space-1` | 4px | gap ระหว่าง icon กับ label |
| `--space-2` | 8px | gap ภายใน row |
| `--space-3` | 12px | padding ภายใน small card |
| `--space-4` | 16px | padding ภายใน card หลัก |
| `--space-5` | 20px | margin ระหว่าง section |
| `--space-6` | 24px | page horizontal padding |

### Border Radius

| Token | Value | ใช้งาน |
|---|---|---|
| `--radius-sm` | 8px | badge, tag เล็กๆ |
| `--radius-md` | 12px | input field, toast |
| `--radius-lg` | 14px | button, nav item |
| `--radius-xl` | 16px | card หลัก, symptom card |
| `--radius-2xl` | 32px | phone frame (mockup shell) |
| `--radius-full` | 9999px | avatar, dot indicator |

---

## 5. Elevation (Shadow)

| Level | Value | ใช้งาน |
|---|---|---|
| `shadow-subtle` | `0 1px 4px rgba(0,0,0,0.06)` | card ปกติ |
| `shadow-md` | `0 4px 16px rgba(0,0,0,0.08)` | modal, dropdown |
| `shadow-lg` | `0 20px 60px rgba(0,0,0,0.12)` | phone frame |
| `shadow-symptom` | `0 4px 14px {color}40` | selected symptom card |

---

## 6. Components

### 6.1 Symptom Card

> Signature component — ออกแบบเพื่อแอพนี้โดยเฉพาะ

```
┌─────────────────────────────────────┐
│  😊   ปกติ                          │  ← unselected: bg = tint
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  😊   ปกติ              ✓ เลือกแล้ว │  ← selected: bg = solid, text = white
└─────────────────────────────────────┘
```

**States:**

| State | Background | Border | Text | Shadow |
|---|---|---|---|---|
| Default | symptom tint | symptom border | `--text-primary` | `shadow-subtle` |
| Selected | symptom solid | symptom solid | `#ffffff` | `shadow-symptom` |
| Hover | tint + 5% darken | — | — | — |

**Layout:** 2 คอลัมน์ grid สำหรับ 6 ตัว  
**Size:** min-height 64px, emoji 28px, label 13px/700

---

### 6.2 Calendar Grid

```
จ    อ    พ    พฤ   ศ    ส    อา
─────────────────────────────────
     1    2    3    4    5    6
7    8    9    10   11   12   13
```

- แต่ละ cell: aspect-ratio 1:1, border-radius `--radius-sm`
- Cell มีข้อมูล: solid symptom color + เลข + emoji เล็กๆ
- Cell ไม่มีข้อมูล: `--symptom-no-data`
- Cell อนาคต: transparent + opacity 0.25
- Cell วันนี้: outline 2px `--color-primary`
- Header วัน อา: สีแดง `#EF4444`

---

### 6.3 Button

**Primary**
```
background: --color-primary
color: #fff
padding: 14px
border-radius: --radius-lg
font: 15px/700
width: 100%
```

**Secondary**
```
background: #fff
border: 1.5px solid --color-border
color: --text-secondary
padding: 13px
```

**Disabled:** opacity 0.4, cursor not-allowed  
**Loading:** ข้อความเปลี่ยน เช่น "กำลังเข้าสู่ระบบ..." + ปิด pointer events

**Variant ตามบริบท:**
- Logout → `background: --color-danger`
- Export PDF → `background: --color-export`

---

### 6.4 Input Field

```
padding: 13px 14px
border: 1.5px solid --color-border
border-radius: --radius-md
background: --color-bg
font: 15px/400
color: --text-primary
```

Focus: `border-color: --color-primary`, `outline: none`  
Error: `border-color: --color-danger`  
Placeholder: `--text-muted`

---

### 6.5 Bottom Navigation

```
┌────────────────────────────────┐
│  📝 บันทึก  📅 สรุปเดือน  👤 โปรไฟล์ │
└────────────────────────────────┘
```

- Fixed bottom, full width, max-width 420px
- `background: #fff`, `border-top: 1px solid --color-border`
- Active tab: `--color-primary` / 700 weight
- Inactive tab: `--text-muted` / 400 weight
- Tab height: ~64px รวม safe area
- Touch target แต่ละ tab: flex: 1

---

### 6.6 Toast Notification

```
background: --text-primary (#0F172A)
color: #fff
padding: 10px 20px
border-radius: --radius-md
font: 14px/700
position: fixed, bottom: 90px (เหนือ nav)
```

- Export PDF toast: `background: --color-export`
- Auto-dismiss หลัง 2.5 วินาที

---

### 6.7 Month Picker

```
  ┌───────────────────────────────────┐
  │  ‹      มกราคม 2568      ›        │
  └───────────────────────────────────┘
```

- Nav button: 36×36px, `border-radius: --radius-sm`
- ปุ่ม › disabled เมื่อถึงเดือนปัจจุบัน (opacity 0.3)

---

## 7. Layout

### 7.1 Screen Frame

```
┌──────────────────────────────┐  max-width: 420px
│  padding: 24px 16px          │  centered
│  padding-bottom: 100px       │  (เว้นให้ bottom nav)
│                              │
│  content...                  │
│                              │
├──────────────────────────────┤
│     Bottom Navigation        │  fixed, height ~64px
└──────────────────────────────┘
```

### 7.2 Page Header Pattern

```
[eyebrow label 12px]
[Display heading 22px]    [avatar / icon]
```

ทุกหน้าใช้ pattern นี้ที่ด้านบน เพื่อให้รู้ทันทีว่าอยู่หน้าไหน

### 7.3 Card Pattern

```
┌──────────────────────────────────┐
│  [small label 12px]              │  ← label บอกว่า card นี้ทำอะไร
│                                  │
│  content                         │
│                                  │
└──────────────────────────────────┘
border-radius: --radius-xl
border: 1px solid --color-border-subtle
box-shadow: shadow-subtle
padding: --space-4
```

---

## 8. Page-by-Page Layout

### 8.1 Login / Register

```
        🏥
     KidHealth
  ติดตามสุขภาพลูก

  ┌─────────────────┐
  │ อีเมล           │
  └─────────────────┘
  ┌─────────────────┐
  │ รหัสผ่าน       │
  └─────────────────┘

  [  เข้าสู่ระบบ  ]
  [  สมัครสมาชิก  ]
```

- จัดกลางแนวตั้ง (flex + justify-content: center)
- logo + title ไม่มี card ล้อม เพื่อให้โล่ง

---

### 8.2 Dashboard

```
  บันทึกอาการ          ← eyebrow
   สวัสดี พ่อแม่น้องมีมี 👋  [👦/👧/👶]

  ┌─ เลือกวันที่ ──────────────────┐
  │  📆 [dropdown]                 │
  └────────────────────────────────┘

  เลือกอาการของวันนี้

  ┌──────────┐  ┌──────────┐
  │ 😊 ปกติ  │  │ 🤧 น้ำมูก│
  └──────────┘  └──────────┘
  ┌──────────┐  ┌──────────┐
  │ 🌡️ มีไข้ │  │ 😷 ไข้+  │
  └──────────┘  └──────────┘
  ┌──────────────────────────┐
  │ 🤒 ไข้ + น้ำมูกเขียว    │
  └──────────────────────────┘

  [ บันทึกอาการ ]
```

---

### 8.3 Summary

```
  สรุปสุขภาพ            ← eyebrow
  ปฏิทินอาการ

  ┌─ ‹  มกราคม 2568  › ──────────┐
  └─────────────────────────────┘

  ┌─ Calendar Grid ──────────────┐
  │ จ  อ  พ  พฤ  ศ   ส   อา    │
  │ ██ ██ ░░  ██ ██  ██  ██    │  ← สี symptom
  │ ...                         │
  └─────────────────────────────┘

  ┌─ Legend ────────────────────┐
  │ 🟢 ปกติ            12 วัน  │
  │ 🔵 น้ำมูกใส         3 วัน  │
  │ ...                         │
  └─────────────────────────────┘

  [ 📄 Export PDF ]
```

---

### 8.4 Profile

```
  ┌─────────────────────────────┐
  │ gradient header             │
  │  [👩] คุณแม่มนัสนันท์      │  ← first_name + last_name
  │       manat@email.com       │
  ├─────────────────────────────┤
  │ 👶 ชื่อลูก     [น้องมีมี]   │  ← editable input
  │ 🎂 วันเกิดลูก  [12 ม.ค. 65]│  ← date input (:max = วันนี้, แสดงอายุอัตโนมัติ)
  │ ⚤ เพศลูก      [👦 ชาย / 👧 หญิง] │  ← gender toggle button
  │ 📊 บันทึกเดือนนี้  45 วัน   │
  └─────────────────────────────┘

  [ บันทึก ]   ← ใช้บันทึก child_name / child_birthday
  [ ออกจากระบบ ]   ← danger red
```

Profile card header ใช้ gradient เดียวในแอพ (`#0EA5E9 → #6366F1`) เพื่อให้ section นี้รู้สึก "พิเศษ" กว่า card ทั่วไป

**อายุคำนวณอัตโนมัติ:**
- child_birthday → แสดงอายุเป็น "2 ปี 3 เดือน" หรือ "8 เดือน" (ถ้า < 2 ปี) หรือ "15 วัน" (ถ้า < 1 เดือน)
- อัปเดตทุกครั้งที่เปิดหน้า profile และเมื่อเปลี่ยน child_birthday

---

## 9. Motion

ใช้ motion น้อยและมีเหตุผล — แอพสุขภาพต้องการความมั่นคง ไม่ใช่ความสนุกสนาน

| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Symptom card select | `scale: 1 → 0.97` | 150ms | ease-out |
| Button press | `opacity: 1 → 0.8` | 100ms | — |
| Toast appear | `translateY: 20px → 0` + fade in | 200ms | ease-out |
| Toast dismiss | fade out | 300ms | ease-in |
| Page transition | — | — | ไม่มี (ความเร็วสำคัญกว่า) |

**`prefers-reduced-motion`:** ปิด transform ทั้งหมด คง opacity transition ไว้

```css
@media (prefers-reduced-motion: reduce) {
  * { transition: opacity 150ms ease !important; transform: none !important; }
}
```

---

## 10. Copy Guidelines

**Tone:** อบอุ่น กระชับ ภาษาไทยธรรมชาติ ไม่ formal เกินไป

| สถานการณ์ | ❌ อย่าเขียน | ✅ เขียนแบบนี้ |
|---|---|---|
| หลังบันทึก | "การบันทึกข้อมูลเสร็จสมบูรณ์" | "✓ บันทึกอาการเรียบร้อย" |
| Input ว่าง | "กรุณากรอกข้อมูลในช่องที่กำหนด" | "กรุณากรอกอีเมลและรหัสผ่าน" |
| รหัสผ่านไม่ตรง | "ข้อมูลไม่ถูกต้อง" | "รหัสผ่านไม่ตรงกัน" |
| หลัง register | "ระบบได้ส่งอีเมลไปยังที่อยู่ที่ให้ไว้" | "กรุณายืนยัน email ก่อนเข้าใช้งาน" |
| ปุ่ม save | "Submit" / "ยืนยัน" | "บันทึกอาการ" |
| ปุ่ม export | "Generate Document" | "Export PDF" |

**ปุ่ม Loading state:** ใช้ present continuous
- "กำลังเข้าสู่ระบบ..." / "กำลังสร้างบัญชี..."

**Error messages:** บอกสาเหตุ + วิธีแก้ ไม่ใช่แค่ "เกิดข้อผิดพลาด"

---

## 11. Accessibility

- Touch target ขั้นต่ำ: **44×44px** ทุก interactive element
- Color ไม่ใช่ข้อมูลเดียว: symptom card มี emoji + label ควบคู่สีเสมอ
- Focus ring: `outline: 2px solid --color-primary; outline-offset: 2px`
- Contrast ratio: text on white ≥ 4.5:1, text on symptom solid color ใช้ #fff เสมอ
- Input `autocomplete`: email field ใช้ `autocomplete="email"`, password ใช้ `autocomplete="current-password"` / `"new-password"`

---

## 12. File Structure (Design assets)

```
src/
└── styles/
    ├── tokens.css        # CSS custom properties ทั้งหมดจาก doc นี้
    ├── typography.css    # type scale + font import
    ├── base.css          # reset + body defaults
    └── components/
        ├── button.css
        ├── input.css
        ├── symptom-card.css
        ├── calendar.css
        ├── bottom-nav.css
        └── toast.css
```

หรือถ้าใช้ Tailwind v4: map token ผ่าน CSS `@theme` directive ใน `style.css` หรือ `tokens.css`

```css
/* style.css หรือ tokens.css */
@import "tailwindcss";

@theme {
  --color-primary: #0EA5E9;
  --color-primary-dark: #0284C7;
  --color-danger: #EF4444;
  --color-export: #7C3AED;
  --color-symptom-normal: #22C55E;
  --color-symptom-runny-clear: #3B82F6;
  --color-symptom-fever: #F97316;
  --color-symptom-fever-runny-clear: #EF4444;
  --color-symptom-runny-green: #84CC16;
  --color-symptom-fever-runny-green: #78716C;
  --color-symptom-no-data: #F1F5F9;
  --font-family-sans: 'Sarabun', 'Noto Sans Thai', system-ui;
  --radius-xl: 16px;
  --radius-2xl: 32px;
}
```

> **Tailwind v4:** ใช้ `@import "tailwindcss"` + `@theme` directive แทน `tailwind.config.js` / `postcss.config.js`  
> ดูเพิ่มเติม: [Tailwind v4 CSS-first configuration](https://tailwindcss.com/blog/tailwindcss-v4#css-first-configuration)
