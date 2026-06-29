---
description: Review code/plan/PR แบบ outsider perspective
---

/scrutinize $ARGUMENTS

ทำตาม workflow นี้:

1. **Intent** — เป้าหมายคืออะไรใน 1 ประโยค? มีวิธี simpler/elegant กว่าไหม? (ไม่ทำ? ใช้ของที่มี?)
2. **Trace** — walk code path จริง ไม่ใช่แค่ diff — entry → call sites → branches → state → exit
3. **Verify** — code ทำตาม claim จริงไหม? edge cases? testing จริงหรือ mock?
4. **Report** — เรียง severity (blocker → major → nit)
   - แต่ละ finding: อะไร, ทำไมสำคัญ, evidence (file:line), suggestion

จบด้วย verdict: ship / fix-then-ship / rework / reject + เหตุผลหลัก
ห้าม rubber-stamp — ถ้าไม่มีปัญหา real ให้บอกว่า trace อะไรไปบ้าง
