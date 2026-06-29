---
name: post-mortem
description: เขียน engineering record ของ bug ที่ fix แล้ว — root cause, mechanism, fix, validation, how it slipped through
---

# Post-mortem

Engineering record ของ bug fix เขียน **หลัง** debugging เสร็จและ fix ถูก validated แล้ว
สำหรับ engineer ด้วยกัน (และ future-you ที่จะลืมทุกอย่างใน 6 เดือน)

---

## Required inputs — ปฏิเสธถ้าขาด

- [ ] Reliable repro
- [ ] Root cause known
- [ ] Fix identified (PR/commit pointer)
- [ ] Fix validated (repro ผ่านแล้ว)

## Structure

### 1. Summary _(mandatory)_
1 paragraph: อะไรพัง (user terms), อะไร fix, JIRA key, PR number, owner

### 2. Symptom
สิ่งที่สังเกตเห็นจริงๆ: test output, error message, log line, customer report

### 3. Root cause _(mandatory)_
กลไกของ bug จริงๆ — ใช้ code identifiers: function names, file paths, branch conditions, commit SHAs
Walk cause chain end-to-end

### 4. Why it produced the symptom
เชื่อม root cause → symptom — ทำไมจาก A ถึงเห็นผลเป็น B

### 5. Fix _(mandatory)_
อะไรเปลี่ยน และ **ทำไม fix นี้ถึงแก้ root cause** ไม่ใช่แค่ปิด symptom
Link PR/commit ถ้ามี fix ก่อนหน้าที่ failed ให้พูดถึง

### 6. How it was found
Repro อะไรที่ทำให้ deterministic, tools อะไรที่ crack ได้, hypotheses ที่ลองแล้ว reject พร้อมเหตุผล, experiment ไหนที่ confirm

### 7. Why it slipped through
CI gap? Latent code? Workload gap? Incomplete prior fix? Review miss?
**Blameless** — บอก gap, ไม่ใช่คน

### 8. Validation _(mandatory)_
proof ว่า fix ทำงาน: test ผ่าน, workload complete, stress run clean
บอก coverage จริง — "tested only on X" ดีกว่า imply broader coverage

### 9. Action items / follow-ups
regression test, CI gap, refactor, doc update — each with owner + tracking artifact
ถ้าไม่มี action items → "None — fix is sufficient"

## Tone

- engineer-to-engineer: code identifiers welcome
- mechanism over narrative
- active voice, concrete subjects
- **blameless**
- no hedging ("we believe", "appears to")
