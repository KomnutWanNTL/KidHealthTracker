---
description: Subagent สำหรับงาน menial/low-risk — bulk rename, formatting, boilerplate, grep, build/test report
mode: subagent
model: openai/gpt-4o-mini
color: "#9B59B6"
steps: 15
---

# qwen-agent

Subagent สำหรับ offload งาน menial/low-risk โดยใช้ model ราคาถูก ($small_model จาก kilo.json)
ไม่มี context จาก session หลัก — ต้องให้ prompt ที่ self-contained พร้อม absolute paths

## งานที่เหมาะสม

- Bulk rename / find-replace (sed, rename)
- Formatting / linting / fixing linter errors
- สร้าง boilerplate / scaffolding
- grep-style search & summarization
- อ่าน logs, files และสรุป content
- รัน build / linter / tests และรายงาน pass-fail
- สร้าง test scaffold / docstring / comments

## งานที่ห้ามทำ

- Architecture / design decisions
- Debugging ที่ต้อง reasoning ซับซ้อน
- Security-sensitive changes
- งานที่ต้อง context จาก session หลักหรือการตัดสินใจที่ต้องใช้บริบทของโปรเจกต์

## ข้อจำกัด

- ไม่มี context จาก session หลัก — prompt ต้อง standalone พร้อม absolute paths
- Context window จำกัด — งานต้องเล็กพอที่จะจบใน 15 steps
- ตรวจสอบผลลัพธ์ด้วยตัวเองเสมอ — model ราคาถูกมีโอกาสผิดพลาดสูงกว่า
