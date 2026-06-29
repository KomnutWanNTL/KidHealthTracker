# KidHealth Tracker — Agent Guidelines

โปรเจกต์: Vue 3 + Supabase + Vite + Tailwind CSS PWA สำหรับบันทึกอาการป่วยรายวันของลูก
Repo structure: `KidHealthTracker/` เป็น root ของ source code (Vite project)
Env files: `KidHealthTracker/.env.development`, `KidHealthTracker/.env.production`

---

## 1. การทำงานทั่วไป

- **ถามก่อนเขียนเสมอ** — โดยเฉพาะการเปลี่ยนแปลงที่กระทบ data model (Supabase schema, RLS policies), auth flow, หรือ API contracts
- **Vue 3 Composition API + `<script setup>`** — ใช้ pattern นี้ทุก component
- **Pinia stores** — ใช้ `defineStore` ชื่อ `use<Name>Store` pattern
- **Tailwind CSS v4** — ใช้ utility classes เป็นหลัก; ใช้ `styles/` เฉพาะเมื่อต้อง override หรือ design token ที่ซับซ้อน
- **ไม่เพิ่ม dependency ใหม่** โดยไม่ถามก่อน

---

## 2. การ Debug (debug-mantra)

เมื่อเจอบั๊ก ให้ทำตามขั้นตอนนี้ก่อนเสนอ fix:

1. **Reproduce ให้ได้ก่อน**
   - ถ้า reproduce ไม่ได้ → หยุด ถาม user
   - ถ้า flaky → เพิ่ม rate ก่อน (loop, parallel, logging)

2. **หา fail path**
   - ไล่ code path จาก entry point → จุดที่พัง
   - ดูค่าที่ต่างระหว่าง "ตอนพัง" กับ "ตอนไม่พัง"

3. **Falsify hypothesis**
   - hypothesis นี้ explain symptom ได้หมดหรือไม่?
   - ทดสอบ disprove ก่อน
   - อย่า stuck ที่ hypothesis แรก

4. **Maintain breadcrumb ledger**
   - เก็บบันทึกทุก experiment (เปลี่ยนอะไร → เกิดอะไร → เรียนรู้อะไร)
   - hypothesis ใหม่ต้อง explain breadcrumb ทั้งหมดก่อนหน้า

---

## 3. Context Management (qwenchance)

งานยาวๆ เสี่ยง context overflow:

- **Loop detection:** ถ้ากำลังอ่านซ้ำ / รัน command ซ้ำ / กลับไป hypothesis เดิม → หยุด เปลี่ยน action
- **Over-thinking:** ถ้าคิดนานเกิน ~500 คำโดยไม่ลงมือ → ตัดสินใจด้วยข้อมูลที่มี หรือถาม user 1 คำถาม
- **Context budget:** 20+ turns / อ่าน 5+ files / plan 3+ steps เหลือ → เตรียม handoff
- **Retry cap:** ห้ามรัน command เดียวกันครั้งที่ 3 (แม้จะเปลี่ยน args) ถ้า error ซ้ำ → ถาม user
- **Edit discipline:** อ่านให้เข้าใจก่อน edit → edit 1 ที่ → verify ทันที → ไปต่อ

---

## 4. การ Review (scrutinize)

เมื่อถูกขอให้ review code/plan/PR:

- ถาม intent ก่อน — มีวิธี simpler/elegant กว่าไหม?
- Trace code path จริง ไม่ใช่แค่ diff
- Verify ว่า code ทำตาม claim — edge cases, testing
- รายงานเรียง severity พร้อม evidence และ suggestion
- ห้าม rubber-stamp "LGTM" โดยไม่ trace

---

## 5. Handoff Protocol

เมื่อ context ใกล้เต็ม หรือถูกขอให้ handoff:

1. **Save งานที่ค้าง** — commit หรือบันทึก artifact ไว้
2. **สรุปสถานะ**: อะไรทำแล้ว, อะไรยังค้าง, blockers, next steps
3. **แจ้ง user**: "Context ใกล้เต็ม — เริ่ม session ใหม่ด้วย /clear"

---

## 6. โครงสร้างโปรเจกต์

```
KidHealthTracker/           # Vite project root
├── src/
│   ├── main.js             # Entry point (app mount)
│   ├── App.vue             # Root component
│   ├── router/index.js     # Vue Router + auth guard
│   ├── stores/
│   │   ├── auth.js         # Pinia auth store
│   │   ├── logs.js         # Pinia daily logs store
│   │   └── profile.js      # Pinia profile store
│   ├── pages/
│   │   ├── LoginPage.vue
│   │   ├── RegisterPage.vue
│   │   ├── VerifyEmailPage.vue
│   │   ├── DashboardPage.vue
│   │   ├── SummaryPage.vue
│   │   └── ProfilePage.vue
│   ├── components/
│   │   ├── BottomNav.vue
│   │   ├── CalendarGrid.vue
│   │   ├── Legend.vue
│   │   ├── MonthPicker.vue
│   │   ├── SymptomCard.vue
│   │   └── ToastContainer.vue
│   ├── composables/
│   │   ├── useExportPdf.js
│   │   └── useToast.js
│   ├── constants/symptoms.js
│   ├── lib/supabase.js
│   └── styles/
├── public/
├── .env.development
├── .env.production
├── vite.config.js
├── index.html
└── package.json
```
