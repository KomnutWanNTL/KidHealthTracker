---
name: scrutinize
description: Review โค้ด/plan/PR แบบ outsider perspective — ถาม intent, trace code path จริง, verify claims
---

# Scrutinize

ยืนอยู่ข้างนอกการเปลี่ยนแปลง แล้วถามว่าควรมีมันอยู่ไหม จากนั้น verify ว่ามันทำตามที่อ้างจริงๆ

---

## Workflow

### 1. Intent — สิ่งนี้พยายามทำอะไร?

- เขียนเป้าหมาย 1 ประโยคด้วยคำพูดตัวเอง ถ้าเขียนไม่ได้ → artifact underspecified
- **ถาม: มีวิธี simpler / smaller / more elegant กว่าไหม?**
  - ไม่ทำเลย?
  - ใช้ของที่มีอยู่แล้วใน codebase?
  - แก้ที่ layer อื่น (config vs code, framework vs app)?

### 2. Trace — walk code path จริง

- สำหรับแต่ละ behavior ที่ change อ้าง: trace end-to-end
  - entry point → call sites → branches → state mutated → exit / side effect
  - รวม unchanged code ทั้งสองข้างของ diff — bug ซ่อนที่ seam
- บันทึกทุกจุดที่ trace แล้ว **surprise** — unexpected branch, dead code reached, state ที่ไม่รู้มาก่อน

### 3. Verify — มันทำตามที่อ้างจริงไหม?

- code path ที่ trace สร้าง behavior ที่อ้างจริงหรือ?
- inputs/states อะไรที่จะทำลายมัน? edge cases, concurrent, error paths, retries, null/empty/unicode
- มันเปลี่ยนอะไรอย่างเงียบๆ? performance, error semantics, observability, contract
- test จริงๆ test path ที่เปลี่ยนหรือเปล่า? หรือผ่านเพราะ mock / happy path only?

### 4. Report

เรียง severity: blocker → major → nit

แต่ละ finding:
- **Finding** — 1 ประโยค, เฉพาะเจาะจง, `file:line`
- **Why it matters** — consequence
- **Evidence** — trace step ที่ expose
- **Suggested change** — concrete, minimal

จบด้วย 1-line verdict: ship / fix-then-ship / rework / reject + single biggest reason

---

## Rules

- No rubber-stamps — "LGTM" ไม่ใช่ output
- Cite or it didn't happen — ทุก claim ต้องมี file:line หรือ path
- Distinguish claim from verification — "PR says X" vs "I traced X and confirmed"
- 1 simpler-alternative pass mandatory — ยกเว้น user บอก "don't question scope"
- No flattery, no hedging
