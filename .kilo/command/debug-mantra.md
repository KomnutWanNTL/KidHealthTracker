---
description: 4-step debugging workflow — reproduce, trace, falsify, breadcrumb
---

เรียกใช้ Debug Mantra workflow สำหรับปัญหานี้:

$ARGUMENTS

ทำตามลำดับ ห้ามข้ามขั้น:

1. **Reproduce** — สร้าง reliable repro ก่อนเสนอ fix
   - ถ้า flaky → เพิ่ม rate (loop, parallel, stress)
   - ถ้าไม่มี repro → หยุด ถาม user

2. **Trace fail path** — ไล่ code path จาก entry → จุดที่พัง
   - debugger → source trace + knobs → in-code instrumentation
   - หาความแตกต่างระหว่าง "พัง" กับ "ไม่พัง"

3. **Falsify hypothesis** — ทดลอง disprove hypothesis ก่อน prove
   - hypothesis นี้ explain symptom ทั้งหมดไหม?
   - สร้าง 3-5 hypotheses, อย่า stuck ที่ idea แรก

4. **Breadcrumb ledger** — เก็บบันทึกทุก experiment
   - hypothesis ใหม่ ต้อง explain observation ทั้งหมดที่ผ่านมา
   - อัปเดต ledger หลังทุก run

ห้ามกระโดดไปเสนอ fix โดยที่ repro ยังไม่ reliable
