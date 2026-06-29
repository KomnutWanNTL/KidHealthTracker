---
name: debug-mantra
description: สี่ขั้นตอนการ debug: reproduce → trace fail path → falsify hypothesis → cross-reference breadcrumbs ใช้เมื่อ user รายงาน bug, error, หรือถามให้ debug
---

# Debug Mantra

สี่ขั้นตอนสำหรับ debug session ใช้ตามลำดับก่อนเสนอ fix

---

## 1. Reproduce ให้ได้ก่อน

- **Reliable repro** → สร้าง failing test, curl script, หรือขั้นตอนที่ชัดเจน
- **Flaky repro** → เพิ่ม rate ก่อน loop, parallel, stress, narrow timing
- **ไม่มี repro** → หยุด แจ้ง user ว่ายังไม่สามารถ debug ได้ ถามหา env/log/instrumentation
- **เป้าหมาย:** repro ที่ deterministic, เร็ว (1–5 วินาที), pass/fail ชัดเจน

## 2. หา fail path

หาว่า code แตกตรงไหน และอะไรคือความแตกต่างระหว่าง "พัง" กับ "ไม่พัง"

1. **Debugger** — attach debugger ก่อน ถ้า env รองรับ
2. **Source trace + knobs** — trace code path end-to-end, enumerate knobs (config flags, env vars, branch conditions, timing)
3. **In-code instrumentation** — `console.log` / printf ที่จุดที่สงสัย, ใช้ unique prefix `[DBG-xxxx]` เพื่อ grep ทิ้งทีหลัง

## 3. Falsify hypothesis

เมื่อมี candidate root cause — scrutinize ก่อน test:

- hypothesis นี้ explain symptom ได้จริงไหม? walk through ทั้ง chain
- อะไรคือ simplest proof? อะไรคือ cleanest disproof?
- **Run disproof ก่อน** — ถ้า hypothesis ตาย = ไม่เสียเวลา chase phantom
- สร้าง 3–5 hypotheses ranked อย่า stuck ที่ idea แรก

## 4. Every run is a breadcrumb

- เก็บ ledger: เปลี่ยนอะไร → เกิดอะไร → เรียนรู้อะไร
- hypothesis ใหม่ต้อง explain every prior observation
- ออกแบบ single experiment ที่จะ confirm/t disprove hypothesis นี้อย่างชัดเจน
- อัปเดต ledger หลังทุก run

---

## Operating rules

- ใช้ตอน debug session — ไม่ใช่ general instruction
- ห้ามเสนอ fix ก่อน step 1 เสร็จ (reliable repro)
- ห้ามเริ่ม test hypotheses ก่อน step 2
- ห้าม commit กับ hypothesis ก่อน step 3 ลอง disprove
- ห้าม declare hypothesis ถูกต้องก่อน step 4 ยืนยันกับทุก breadcrumb
