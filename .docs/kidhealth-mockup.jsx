import { useState, useMemo } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const SYMPTOMS = [
  { code: "NORMAL",            label: "ปกติ",                emoji: "😊", color: "#22C55E", bg: "#F0FDF4", border: "#86EFAC" },
  { code: "RUNNY_CLEAR",       label: "น้ำมูกใส",            emoji: "🤧", color: "#3B82F6", bg: "#EFF6FF", border: "#93C5FD" },
  { code: "FEVER",             label: "มีไข้",               emoji: "🌡️", color: "#F97316", bg: "#FFF7ED", border: "#FED7AA" },
  { code: "FEVER_RUNNY_CLEAR", label: "ไข้ + น้ำมูกใส",     emoji: "😷", color: "#EF4444", bg: "#FEF2F2", border: "#FCA5A5" },
  { code: "FEVER_RUNNY_GREEN", label: "ไข้ + น้ำมูกเขียว",  emoji: "🤒", color: "#78716C", bg: "#FAFAF9", border: "#D6D3D1" },
];

const SYMPTOM_MAP = Object.fromEntries(SYMPTOMS.map(s => [s.code, s]));

const DAYS_TH = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];
const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];

// ─── Mock data ────────────────────────────────────────────────────────────────
function generateMockLogs(year, month) {
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const logs = {};
  const codes = SYMPTOMS.map(s => s.code);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    if (date > today) break;
    if (Math.random() > 0.15) {
      logs[d] = codes[Math.floor(Math.random() * codes.length)];
    }
  }
  return logs;
}

const today = new Date();
const MOCK_LOGS = {
  [`${today.getFullYear()}-${today.getMonth()}`]: generateMockLogs(today.getFullYear(), today.getMonth()),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMonthLogs(year, month) {
  const key = `${year}-${month}`;
  if (!MOCK_LOGS[key]) MOCK_LOGS[key] = generateMockLogs(year, month);
  return MOCK_LOGS[key];
}

function pad(n) { return String(n).padStart(2, "0"); }

// ─── Components ───────────────────────────────────────────────────────────────

function BottomNav({ page, setPage }) {
  const tabs = [
    { id: "dashboard", icon: "📝", label: "บันทึก" },
    { id: "summary",   icon: "📅", label: "สรุปเดือน" },
    { id: "profile",   icon: "👤", label: "โปรไฟล์" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 420,
      background: "#fff", borderTop: "1px solid #E2E8F0",
      display: "flex", zIndex: 100,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setPage(t.id)} style={{
          flex: 1, padding: "10px 0 14px", border: "none", background: "none",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          cursor: "pointer",
          color: page === t.id ? "#0EA5E9" : "#94A3B8",
          fontWeight: page === t.id ? 700 : 400,
          fontSize: 11,
          transition: "color 0.15s",
        }}>
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Login ──────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, goRegister }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function handle() {
    setErr("");
    if (!email || !pass) { setErr("กรุณากรอกอีเมลและรหัสผ่าน"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (pass.length < 4) { setErr("รหัสผ่านไม่ถูกต้อง"); return; }
      onLogin();
    }, 800);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, gap: 0 }}>
      <div style={{ fontSize: 56, marginBottom: 8 }}>🏥</div>
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0F172A", letterSpacing: -0.5 }}>KidHealth</h1>
      <p style={{ margin: "4px 0 32px", color: "#64748B", fontSize: 14 }}>ติดตามสุขภาพลูกน้อยทุกวัน</p>

      <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          placeholder="อีเมล"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
          type="email"
        />
        <input
          placeholder="รหัสผ่าน"
          value={pass}
          onChange={e => setPass(e.target.value)}
          type="password"
          style={inputStyle}
          onKeyDown={e => e.key === "Enter" && handle()}
        />
        {err && <p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{err}</p>}
        <button onClick={handle} style={btnPrimary} disabled={loading}>
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
        <button onClick={goRegister} style={btnSecondary}>สมัครสมาชิกใหม่</button>
      </div>
      <p style={{ marginTop: 32, color: "#94A3B8", fontSize: 12 }}>กรอกอะไรก็ได้ รหัสผ่าน ≥ 4 ตัว</p>
    </div>
  );
}

// ── Register ───────────────────────────────────────────────────────────────────
function RegisterPage({ onDone, goLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  function handle() {
    setErr("");
    if (!email || !pass || !confirm) { setErr("กรุณากรอกข้อมูลให้ครบ"); return; }
    if (pass.length < 8) { setErr("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return; }
    if (pass !== confirm) { setErr("รหัสผ่านไม่ตรงกัน"); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 900);
  }

  if (done) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, gap: 12, textAlign: "center" }}>
      <div style={{ fontSize: 64 }}>📬</div>
      <h2 style={{ margin: 0, color: "#0F172A", fontSize: 22, fontWeight: 800 }}>ตรวจสอบอีเมลของคุณ</h2>
      <p style={{ color: "#64748B", fontSize: 14, maxWidth: 280, margin: 0 }}>เราส่งลิงก์ยืนยันไปที่ <strong>{email}</strong> แล้ว กรุณาคลิกลิงก์เพื่อเข้าสู่ระบบ</p>
      <button onClick={onDone} style={{ ...btnPrimary, marginTop: 16, maxWidth: 240 }}>จำลองการยืนยัน → เข้าสู่ระบบ</button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, gap: 0 }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>👶</div>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0F172A" }}>สมัครสมาชิก</h1>
      <p style={{ margin: "4px 0 28px", color: "#64748B", fontSize: 14 }}>สร้างบัญชีเพื่อเริ่มติดตามสุขภาพลูก</p>

      <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
        <input placeholder="อีเมล" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} type="email" />
        <input placeholder="รหัสผ่าน (อย่างน้อย 8 ตัว)" value={pass} onChange={e => setPass(e.target.value)} type="password" style={inputStyle} />
        <input placeholder="ยืนยันรหัสผ่าน" value={confirm} onChange={e => setConfirm(e.target.value)} type="password" style={inputStyle} />
        {err && <p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{err}</p>}
        <button onClick={handle} style={btnPrimary} disabled={loading}>{loading ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก"}</button>
        <button onClick={goLogin} style={btnSecondary}>มีบัญชีแล้ว? เข้าสู่ระบบ</button>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [selectedMonth] = useState(today.getMonth());
  const [selectedYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(false);

  const logs = getMonthLogs(selectedYear, selectedMonth);
  const existingForDay = logs[selectedDate];

  function handleDateChange(e) {
    const d = parseInt(e.target.value);
    setSelectedDate(d);
    setSelected(logs[d] || null);
    setSaved(false);
  }

  function handleSymptom(code) {
    setSelected(code);
    setSaved(false);
  }

  function handleSave() {
    if (!selected) return;
    MOCK_LOGS[`${selectedYear}-${selectedMonth}`][selectedDate] = selected;
    setSaved(true);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  return (
    <div style={{ padding: "24px 16px 100px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "#94A3B8", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>บันทึกอาการ</p>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>สวัสดี คุณแม่ 👋</h2>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👶</div>
      </div>

      {/* Date picker */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "16px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9" }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: 0.5 }}>เลือกวันที่</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 20 }}>📆</span>
          <select value={selectedDate} onChange={handleDateChange} style={{ ...inputStyle, margin: 0, flex: 1, cursor: "pointer" }}>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1)
              .filter(d => new Date(selectedYear, selectedMonth, d) <= today)
              .map(d => (
                <option key={d} value={d}>
                  {d} {MONTHS_TH[selectedMonth]} {selectedYear + 543}
                  {logs[d] ? ` (${SYMPTOM_MAP[logs[d]]?.label})` : ""}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Symptom cards */}
      <p style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 10 }}>เลือกอาการของวันนี้</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {SYMPTOMS.slice(0, 4).map(s => (
          <SymptomCard key={s.code} s={s} selected={selected} onSelect={handleSymptom} />
        ))}
      </div>
      <SymptomCard s={SYMPTOMS[4]} selected={selected} onSelect={handleSymptom} full />

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!selected}
        style={{
          ...btnPrimary,
          marginTop: 20,
          opacity: selected ? 1 : 0.4,
          background: selected ? "#0EA5E9" : "#CBD5E1",
        }}
      >
        {saved ? "✓ บันทึกแล้ว" : "บันทึกอาการ"}
      </button>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
          background: "#0F172A", color: "#fff", padding: "10px 20px",
          borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 200,
          whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}>
          ✓ บันทึกอาการเรียบร้อย
        </div>
      )}
    </div>
  );
}

function SymptomCard({ s, selected, onSelect, full }) {
  const isSelected = selected === s.code;
  return (
    <button
      onClick={() => onSelect(s.code)}
      style={{
        gridColumn: full ? "1 / -1" : undefined,
        background: isSelected ? s.color : s.bg,
        border: `2px solid ${isSelected ? s.color : s.border}`,
        borderRadius: 16,
        padding: "14px 12px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s",
        transform: isSelected ? "scale(0.97)" : "scale(1)",
        boxShadow: isSelected ? `0 4px 14px ${s.color}40` : "0 1px 3px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 28 }}>{s.emoji}</span>
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: isSelected ? "#fff" : "#1E293B" }}>{s.label}</p>
        {isSelected && <p style={{ margin: 0, fontSize: 11, color: "#ffffffcc" }}>✓ เลือกแล้ว</p>}
      </div>
    </button>
  );
}

// ── Summary ───────────────────────────────────────────────────────────────────
function SummaryPage() {
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [exportMsg, setExportMsg] = useState(false);

  const logs = getMonthLogs(year, month);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // จ=0

  const cells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDayOfWeek; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [year, month, daysInMonth, firstDayOfWeek]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    const ny = month === 11 ? year + 1 : year;
    const nm = month === 11 ? 0 : month + 1;
    if (ny > today.getFullYear() || (ny === today.getFullYear() && nm > today.getMonth())) return;
    setYear(ny); setMonth(nm);
  }

  const stats = useMemo(() => {
    const counts = {};
    SYMPTOMS.forEach(s => counts[s.code] = 0);
    Object.values(logs).forEach(code => { if (counts[code] !== undefined) counts[code]++; });
    return counts;
  }, [logs]);

  function handleExport() {
    setExportMsg(true);
    setTimeout(() => setExportMsg(false), 2000);
  }

  const isNextDisabled = year > today.getFullYear() || (year === today.getFullYear() && month >= today.getMonth());

  return (
    <div style={{ padding: "24px 16px 100px" }}>
      <p style={{ margin: "0 0 4px", fontSize: 12, color: "#94A3B8", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>สรุปสุขภาพ</p>
      <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, color: "#0F172A" }}>ปฏิทินอาการ</h2>

      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, background: "#fff", borderRadius: 14, padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9" }}>
        <button onClick={prevMonth} style={navBtn}>‹</button>
        <span style={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>
          {MONTHS_TH[month]} {year + 543}
        </span>
        <button onClick={nextMonth} disabled={isNextDisabled} style={{ ...navBtn, opacity: isNextDisabled ? 0.3 : 1 }}>›</button>
      </div>

      {/* Calendar */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9", marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
          {DAYS_TH.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: d === "อา" ? "#EF4444" : "#94A3B8", padding: "4px 0" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const isFuture = new Date(year, month, day) > today;
            const code = logs[day];
            const s = code ? SYMPTOM_MAP[code] : null;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            return (
              <div key={day} style={{
                aspectRatio: "1",
                borderRadius: 10,
                background: isFuture ? "transparent" : s ? s.color : "#F1F5F9",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity: isFuture ? 0.25 : 1,
                outline: isToday ? "2px solid #0EA5E9" : "none",
                outlineOffset: 1,
                cursor: s ? "default" : "default",
              }}>
                <span style={{ fontSize: 11, fontWeight: isToday ? 800 : 500, color: s ? "#fff" : "#94A3B8" }}>{day}</span>
                {s && <span style={{ fontSize: 10 }}>{s.emoji}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9", marginBottom: 14 }}>
        <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#64748B" }}>สัญลักษณ์สี</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SYMPTOMS.map(s => (
            <div key={s.code} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 5, background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#374151" }}>{s.emoji} {s.label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                {stats[s.code]} วัน
              </span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: 5, background: "#F1F5F9", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#94A3B8" }}>ไม่มีข้อมูล</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8" }}>
              {new Date(year, month + 1, 0).getDate() - Object.keys(logs).length} วัน
            </span>
          </div>
        </div>
      </div>

      {/* Export */}
      <button onClick={handleExport} style={{ ...btnPrimary, background: "#7C3AED" }}>
        📄 Export PDF
      </button>
      {exportMsg && (
        <div style={{
          position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
          background: "#7C3AED", color: "#fff", padding: "10px 20px",
          borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 200,
          whiteSpace: "nowrap",
        }}>
          ✓ ดาวน์โหลด kidhealth-{year}-{pad(month + 1)}.pdf
        </div>
      )}
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────
function ProfilePage({ onLogout }) {
  return (
    <div style={{ padding: "24px 16px 100px" }}>
      <p style={{ margin: "0 0 4px", fontSize: 12, color: "#94A3B8", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>บัญชีผู้ใช้</p>
      <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 800, color: "#0F172A" }}>โปรไฟล์</h2>

      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9", marginBottom: 16 }}>
        <div style={{ background: "linear-gradient(135deg, #0EA5E9, #6366F1)", padding: "24px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>👩</div>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: "#fff" }}>คุณแม่มนัสนันท์</p>
            <p style={{ margin: 0, fontSize: 13, color: "#ffffffbb" }}>manat@email.com</p>
          </div>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { icon: "👶", label: "ชื่อลูก", value: "น้องมีมี" },
            { icon: "🎂", label: "วันเกิดลูก", value: "12 มกราคม 2566" },
            { icon: "📊", label: "บันทึกทั้งหมด", value: `${Object.values(MOCK_LOGS).reduce((a, m) => a + Object.keys(m).length, 0)} วัน` },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{row.icon}</span>
                <span style={{ fontSize: 14, color: "#64748B" }}>{row.label}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onLogout} style={{ ...btnPrimary, background: "#EF4444" }}>
        ออกจากระบบ
      </button>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const inputStyle = {
  padding: "13px 14px",
  borderRadius: 12,
  border: "1.5px solid #E2E8F0",
  fontSize: 15,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  background: "#F8FAFC",
  color: "#0F172A",
  fontFamily: "inherit",
};

const btnPrimary = {
  width: "100%",
  padding: "14px",
  borderRadius: 14,
  border: "none",
  background: "#0EA5E9",
  color: "#fff",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "opacity 0.15s",
};

const btnSecondary = {
  width: "100%",
  padding: "13px",
  borderRadius: 14,
  border: "1.5px solid #E2E8F0",
  background: "#fff",
  color: "#475569",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

const navBtn = {
  width: 36, height: 36,
  borderRadius: 10,
  border: "1.5px solid #E2E8F0",
  background: "#F8FAFC",
  fontSize: 20, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#475569", fontWeight: 700,
  lineHeight: 1,
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login"); // login | register | app
  const [page, setPage] = useState("dashboard");

  if (screen === "login") return (
    <PhoneFrame>
      <LoginPage onLogin={() => setScreen("app")} goRegister={() => setScreen("register")} />
    </PhoneFrame>
  );

  if (screen === "register") return (
    <PhoneFrame>
      <RegisterPage onDone={() => setScreen("app")} goLogin={() => setScreen("login")} />
    </PhoneFrame>
  );

  return (
    <PhoneFrame>
      <div style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif" }}>
        {page === "dashboard" && <DashboardPage />}
        {page === "summary"   && <SummaryPage />}
        {page === "profile"   && <ProfilePage onLogout={() => setScreen("login")} />}
        <BottomNav page={page} setPage={setPage} />
      </div>
    </PhoneFrame>
  );
}

function PhoneFrame({ children }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "24px 0",
      fontFamily: "'Sarabun', 'Noto Sans Thai', system-ui, sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        minHeight: "calc(100vh - 48px)",
        background: "#F8FAFC",
        borderRadius: 32,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)",
        position: "relative",
      }}>
        {children}
      </div>
    </div>
  );
}
