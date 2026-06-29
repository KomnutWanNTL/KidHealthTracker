---
description: เขียน engineering post-mortem / RCA สำหรับ bug ที่ fix แล้ว
---

เขียน post-mortem สำหรับ bug นี้:

$ARGUMENTS

**ตรวจสอบ required inputs ก่อน:** ถ้าขาดอย่างใดอย่างหนึ่ง ให้บอกและหยุด
- [ ] Reliable repro
- [ ] Root cause known
- [ ] Fix identified (PR/commit)
- [ ] Fix validated (repro ผ่าน)

**โครงสร้าง:**
1. Summary — อะไรพัง อะไร fix
2. Symptom — สิ่งที่สังเกตเห็นจริง
3. Root cause — mechanism + code identifiers
4. Why it produced symptom — chain จาก cause → visible failure
5. Fix — อะไรเปลี่ยน + ทำไมแก้ที่ root cause
6. How it was found — repro, tools, hypotheses tried
7. Why it slipped through — CI gap? latent code?
8. Validation — tests, workloads, limitations
9. Action items — regression test, CI gap, refactor

**Tone:** engineer-to-engineer, code identifiers welcome, blameless, ไม่มี hedging
