# KidHealth Tracker

แอพติดตามอาการป่วยรายวันของลูก บันทึกอาการ สรุปผลเป็นปฏิทินสี และส่งออก PDF

**Stack:** Vue 3 (Composition API) · Vite · Supabase (Auth + PostgreSQL) · Vercel · Tailwind CSS · Pinia · jsPDF + html2canvas · vite-plugin-pwa

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

> `.env.production` ไม่ commit ขึ้น Git — ตั้งค่าผ่าน Vercel Dashboard แทน

## Deploy

```bash
# Preview deploy (uses dev Supabase)
vercel

# Production deploy
vercel --prod
```

## Features

- **บันทึกอาการรายวัน** — เลือกวันที่ + อาการ (6 สี) → บันทึก
- **ปฏิทินสรุปรายเดือน** — ดูแนวโน้มสุขภาพเป็นสีรายเดือน
- **ตั้งชื่อลูก + เพศ + วันเกิด** — รูป icon เด็กผู้หญิง/ผู้ชายที่ header
- **Export PDF** — ส่งออกปฏิทินเป็น PDF
- **PWA** — ติดตั้งบน Home Screen ได้ (manifest + service worker)

## Database Migrations

อยู่ใน `.docs/` — รันตามลำดับ:

1. `supabase-migration-prod.sql` — โครงสร้างหลัก (daily_logs + profiles)
2. `supabase-migration-add-runny-green.sql` — เพิ่ม symptom RUNNY_GREEN
3. `supabase-migration-add-child-gender.sql` — เพิ่มฟิลด์ child_gender

## License

MIT
