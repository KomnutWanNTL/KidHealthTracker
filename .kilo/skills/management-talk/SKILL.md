---
name: management-talk
description: แปลง engineering content สำหรับผู้บริหาร (VP, director, PM) และปรับรูปแบบตาม channel — JIRA, Slack, standup, email, meeting talking-points
---

# Management Talk

Rewrite เนื้อหาวิศวกรรมสำหรับ engineering-org leadership ปรับ **tone** และ **format** ตาม channel

---

## Audience

engineering-savvy non-engineers: VP, director, PM, release manager
- อ่าน product/framework names, JIRA keys, PR numbers ได้
- **ไม่** อ่าน function names, file paths, struct fields, commit SHAs, code expressions

## Tone: Keep vs Strip

| Keep | Strip |
|------|-------|
| Product/framework names (Tada, DeepSpeed) | Function names (`tadaLaunchPrepare`) |
| JIRA keys, PR numbers | File paths, struct fields |
| Customer/workload identifiers | Code expressions, line numbers |
| Concept-level tech vocab (race, sync, buffer) | Internal data-structure jargon (`scratchBuf`) |

**แปล** mechanism เป็น 1-2 ประโยค plain English — "GPUs read from uninitialized buffer" → "GPUs อ่านจาก buffer ที่ไม่ได้ initialize"

**Bias** active voice, concrete subjects, short paragraphs
**Avoid** hedging, stating obvious, telling leadership how to do their job, engineering minutiae

## Channel shapes

### JIRA comment / status report
Full structured: **Status/TL;DR**, Impact, What broke, Why now, Owner, Next steps, Workaround, Risk

### Slack post
- 1 bold **TL;DR** เป็นบรรทัดแรก
- 2–4 bullets: impact, owner+link, next step
- ~80 words

### Async standup note
- 1–3 lines
- pattern: `"<state> <thing>. <owner>. <next>."`
- No bullets or labels

### Email
- Subject = TL;DR as noun phrase
- 2–3 flowing paragraphs
- Sign off with next decision point

### Meeting talking-points
- Bullet list, max 1 clause/bullet
- Include numbers/keys ที่จะพูด aloud

## Rules

- Never invent facts — ถ้า source บอก "cause unknown" → rewrite ก็บอก "cause unknown"
- Never strip JIRA key, PR number, customer/workload name
- Get sign-off ก่อน post JIRA
- Never post to Slack/email จาก skill — hand draft ให้ user post
- Stay out of advocacy — status update ไม่ใช่ recommendation memo
