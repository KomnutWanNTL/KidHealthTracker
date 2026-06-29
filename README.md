# KidHealth Tracker

แอพติดตามอาการป่วยรายวันของลูก บันทึกอาการ สรุปผลเป็นปฏิทินสี และส่งออก PDF

**Stack:** Vue 3 (Composition API) · Vite · Supabase (Auth + PostgreSQL) · Vercel · Tailwind CSS v4 · Pinia · jsPDF + html2canvas · vite-plugin-pwa · @vercel/analytics · @vercel/speed-insights

---

## Setup

```bash
# ติดตั้ง dependencies
npm install

# รัน dev server (ใช้ .env.development → dev Supabase)
npm run dev

# Build production (ใช้ .env.production)
npm run build

# Preview production build
npm run preview
```

## Environment Variables

| File | Supabase Project | ใช้ตอน |
|------|-----------------|--------|
| `.env.development` | Dev (`kidhealth-dev`) | `npm run dev` |
| `.env.production` | Prod (`kidhealth-prod`) | `npm run build` / Vercel deploy |

> `.env.production` ห้าม commit ขึ้น Git — ตั้งค่าผ่าน Vercel Dashboard แทน

## Deploy

```bash
# Preview deploy (uses dev Supabase)
vercel

# Production deploy
vercel --prod
```

## Features

- **บันทึกอาการรายวัน** — เลือกวันที่ + อาการ (6 สี) → UPSERT
- **ปฏิทินสรุปรายเดือน** — ดูแนวโน้มสุขภาพเป็นสีรายเดือน พร้อมนับจำนวนวันแต่ละอาการ
- **ตั้งชื่อลูก + เพศ + วันเกิด** — รูป icon เด็กผู้หญิง/ผู้ชายที่ header + อายุคำนวณอัตโนมัติ
- **อัปโหลดรูปโปรไฟล์** — ใช้ Supabase Storage พร้อม auto-compress + HEIC→JPEG conversion
- **Export PDF** — ส่งออกปฏิทินเป็น PDF (iOS PWA รองรับ multi-page slicing)
- **PWA** — ติดตั้งบน Home Screen ได้ (manifest + service worker + iOS A2HS icons)
- **Bottom Navigation** — 3 tabs: Dashboard / Summary / Profile
- **Vercel Analytics + Speed Insights** — ติดตามผู้ใช้และประสิทธิภาพ

## Database Migrations

อยู่ใน `.docs/` — รันตามลำดับใน dev project ก่อน แล้วค่อยรัน prod:

| # | File | สิ่งที่เพิ่ม |
|---|------|-------------|
| 1 | `supabase-migration-prod.sql` | `daily_logs` + `profiles` (base schema), RLS, triggers, indexes |
| 2 | `supabase-migration-add-runny-green.sql` | เพิ่ม symptom `RUNNY_GREEN` ใน CHECK constraint |
| 3 | `supabase-migration-add-child-gender.sql` | เพิ่ม column `child_gender` ใน `profiles` |
| 4 | `supabase/002_add_avatar_url.sql` | เพิ่ม column `avatar_url` ใน `profiles` |
| 5 | `supabase/003_storage_avatars.sql` | สร้าง Storage bucket `avatars` + RLS policies |

## Migration Order สำหรับโปรเจกต์ใหม่

```bash
# 1. Base schema
รัน supabase-migration-prod.sql

# 2. Add RUNNY_GREEN symptom
รัน supabase-migration-add-runny-green.sql

# 3. Add child_gender column
รัน supabase-migration-add-child-gender.sql

# 4. Add avatar_url column
รัน supabase/002_add_avatar_url.sql

# 5. Storage bucket + RLS
รัน supabase/003_storage_avatars.sql
```

## Version History

| Version | การเปลี่ยนแปลง |
|---------|---------------|
| 1.0.0 | เปิดตัว production ครั้งแรก |
| 1.1.0 | — |
| 1.2.0 | RUNNY_GREEN, child_gender, greeting, PWA icon fix, date validation |
| 1.3.0 | PDF Export fit-to-page scaling |
| 1.4.0 | Avatar upload (Supabase Storage) |
| 1.4.1 | Bug fix: avatar upload crash on compressed Blob (no `.name`) |
| 1.4.2 | Bug fix: avatar upload path without extension for upsert overwrite |
| 1.4.3 | Bug fix: avatar cache-busting (`?t={timestamp}`) + iOS HEIC support |
| 1.4.4 | Bug fix: iOS PWA PDF html2canvas full capture + multi-page slicing |

## License

MIT
