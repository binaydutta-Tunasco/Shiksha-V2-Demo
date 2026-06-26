
import { useState, useEffect, useRef } from "react";

// ── DESIGN TOKENS ──────────────────────────────────────────────
// Deep ink navy + warm saffron gold + pure white
// Inspired by Nigerian academic robes (deep blue/navy + gold trim)
const C = {
  navy: "#0B1F3A",
  navyMid: "#162D52",
  gold: "#E8A020",
  goldLight: "#F5C842",
  goldPale: "#FEF3D7",
  white: "#FFFFFF",
  offWhite: "#F7F8FA",
  slate: "#6B7A94",
  green: "#1E8C5A",
  greenLight: "#E8F6EE",
  red: "#C0392B",
  redLight: "#FDECEA",
  amber: "#D97706",
  amberLight: "#FEF3C7",
  border: "#E2E8F0",
  text: "#0B1F3A",
  textSoft: "#4A5568",
};

// ── DUMMY DATA ─────────────────────────────────────────────────
const UNIVERSITY = "Excellence University, Lagos";
const MOTTO = "Light · Knowledge · Service";

const dashData = {
  enrolment: { total: 12840, byFaculty: [
    { name: "Engineering", count: 2410, pct: 19 },
    { name: "Business", count: 3120, pct: 24 },
    { name: "Sciences", count: 2280, pct: 18 },
    { name: "Law", count: 1540, pct: 12 },
    { name: "Medicine", count: 1890, pct: 15 },
    { name: "Arts & SS", count: 1600, pct: 12 },
  ]},
  fees: {
    target: 4200000,
    collected: 3108000,
    outstanding: 1092000,
    pct: 74,
    trend: [52, 58, 63, 68, 74],
    topDefaulters: 342,
  },
  atRisk: {
    total: 487,
    critical: 89,
    moderate: 218,
    watch: 180,
  },
  research: { activeGrants: 14, totalValue: 2340000, upcomingDeadlines: 3 },
  alumni: { registered: 28400, donors: 1240, raised: 186000 },
  ranking: { publications: 142, citations: 891, intlPartnerships: 7 },
};

const atRiskStudents = [
  { id: "EUL/2022/0341", name: "Adaeze Okonkwo", faculty: "Engineering", risk: 91, issues: ["Missed 14 lectures", "3 CA submissions overdue", "Fee balance NGN 180k"] },
  { id: "EUL/2021/1102", name: "Emeka Nwosu", faculty: "Sciences", risk: 84, issues: ["Attendance 38%", "Predicted to fail 2 courses"] },
  { id: "EUL/2023/0587", name: "Fatima Aliyu", faculty: "Business", risk: 78, issues: ["NELFUND disbursement delayed", "Family hardship flagged"] },
  { id: "EUL/2022/0812", name: "Chukwudi Eze", faculty: "Medicine", risk: 73, issues: ["CA average 29/50", "Hostel complaint"] },
  { id: "EUL/2023/1441", name: "Blessing Osei", faculty: "Law", risk: 67, issues: ["Missed 2 continuous assessments", "Low participation score"] },
  { id: "EUL/2022/0290", name: "Ibrahim Musa", faculty: "Arts & SS", risk: 61, issues: ["Fee default risk", "Attendance 51%"] },
];

const examData = {
  session: "2024/2025 Second Semester",
  admitCards: { total: 12840, issued: 11920, pending: 920 },
  centres: [
    { name: "Main Hall A", capacity: 600, allocated: 587 },
    { name: "Main Hall B", capacity: 450, allocated: 441 },
    { name: "Engineering Block", capacity: 320, allocated: 298 },
    { name: "Business Block", capacity: 280, allocated: 265 },
    { name: "Sciences Lab A", capacity: 200, allocated: 192 },
  ],
  results: {
    processed: 9840,
    pending: 3000,
    published: 7200,
    distinctions: 842,
    credits: 3210,
    passes: 2890,
    fails: 898,
    absent: 142,
  },
};

const chatHistory = [
  { from: "user", text: "What programmes does Excellence University offer?" },
  { from: "bot", text: "Excellence University offers programmes in Engineering, Business Administration, Sciences, Law, Medicine, and Arts & Social Sciences. We have over 40 undergraduate and 18 postgraduate programmes. Which area are you most interested in?" },
  { from: "user", text: "I want Engineering. What are the entry requirements?" },
  { from: "bot", text: "For Engineering, you need a minimum of 5 credits in WAEC/NECO including Mathematics, Physics, and English. Your JAMB UTME score must be at least 200, with Physics and Mathematics as subjects. We also require a good result in our Post-UTME screening. Shall I send you the application link?" },
  { from: "user", text: "Yes please" },
  { from: "bot", text: "Here is your application link: apply.eul.edu.ng — Applications close 15 August 2025. You will need: O'Level results, JAMB result slip, passport photograph, and birth certificate. Type HELP at any time for assistance. Good luck! 🎓" },
];

// ── HELPER COMPONENTS ──────────────────────────────────────────
const Ring = ({ pct, size = 80, stroke = 8, color = C.gold }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{transition:"stroke-dasharray 1s ease"}} />
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        fontSize="13" fontWeight="700" fill={C.navy}>{pct}%</text>
    </svg>
  );
};

const Bar = ({ pct, color = C.gold, height = 6 }) => (
  <div style={{ background: C.border, borderRadius: 99, height, overflow: "hidden", width: "100%" }}>
    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 1s ease" }} />
  </div>
);

const Badge = ({ label, color = C.navy, bg = C.goldPale }) => (
  <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, letterSpacing: "0.04em" }}>{label}</span>
);

const RiskBadge = ({ score }) => {
  const color = score >= 80 ? C.red : score >= 65 ? C.amber : C.green;
  const bg = score >= 80 ? C.redLight : score >= 65 ? C.amberLight : C.greenLight;
  const label = score >= 80 ? "CRITICAL" : score >= 65 ? "MODERATE" : "WATCH";
  return <Badge label={label} color={color} bg={bg} />;
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "16px", marginBottom: 12, boxShadow: "0 1px 4px rgba(11,31,58,0.06)", ...style }}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: C.slate, textTransform: "uppercase", marginBottom: 10 }}>{children}</div>
);

const StatRow = ({ label, value, sub, color }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
    <span style={{ fontSize: 13, color: C.textSoft }}>{label}</span>
    <span style={{ fontSize: 14, fontWeight: 700, color: color || C.navy }}>{value} {sub && <span style={{ fontSize: 11, fontWeight: 400, color: C.slate }}>{sub}</span>}</span>
  </div>
);

// ── AI CHAT (calls Anthropic API if online) ────────────────────
const useAIChat = () => {
  const [messages, setMessages] = useState(chatHistory);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const send = async (text) => {
    if (!text.trim()) return;
    const userMsg = { from: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    if (!online) {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: "bot", text: "Thank you for your message! Our admissions team will respond shortly. For urgent queries, call +234-800-EUL-INFO or visit our admissions office." }]);
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `You are the AI Admissions Assistant for Excellence University Lagos (a fictional demo university for a product demonstration). Answer prospective student questions warmly, concisely, and helpfully. Keep responses under 3 sentences. The university offers Engineering, Business, Sciences, Law, Medicine, Arts & Social Sciences. JAMB cutoff is 180, Post-UTME required. Applications close 15 August 2025. For any question you cannot answer precisely, offer to connect them with the admissions office. Always end with a helpful next step. You are demonstrating the shikshaAI WhatsApp Admissions Bot capability.`,
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Thank you for your message. Our team will be in touch shortly.";
      setMessages(prev => [...prev, { from: "bot", text: reply }]);
    } catch {
      setMessages(prev => [...prev, { from: "bot", text: "Thank you for your query! Our admissions team will respond within 24 hours. You can also call +234-800-EUL-INFO." }]);
    }
    setLoading(false);
  };

  return { messages, input, setInput, send, loading, online };
};

// ── SCREENS ────────────────────────────────────────────────────

// SPLASH
const Splash = ({ onEnter }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => { setTimeout(() => setReady(true), 300); }, []);
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 60%, #0D2847 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: `0 8px 32px rgba(232,160,32,0.4)` }}>
          <span style={{ fontSize: 36 }}>🎓</span>
        </div>
        <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>Powered by</div>
        <div style={{ color: C.white, fontSize: 34, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>shiksha<span style={{ color: C.gold }}>AI</span></div>
        <div style={{ color: C.slate, fontSize: 12, letterSpacing: "0.08em", marginBottom: 40 }}>Intelligent University Management System</div>
        <div style={{ background: "rgba(255,255,255,0.06)", border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 14, padding: "16px 24px", marginBottom: 36 }}>
          <div style={{ color: C.white, fontSize: 16, fontWeight: 700 }}>{UNIVERSITY}</div>
          <div style={{ color: C.slate, fontSize: 11, marginTop: 2 }}>{MOTTO}</div>
        </div>
        <button onClick={onEnter} style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, border: "none", borderRadius: 50, padding: "14px 40px", fontSize: 15, fontWeight: 700, color: C.navy, cursor: "pointer", boxShadow: `0 4px 20px rgba(232,160,32,0.4)`, letterSpacing: "0.02em" }}>
          Open VC Dashboard →
        </button>
        <div style={{ color: C.slate, fontSize: 11, marginTop: 16 }}>Demo Mode · Data is illustrative</div>
      </div>
    </div>
  );
};

// DASHBOARD
const Dashboard = () => {
  const [expanded, setExpanded] = useState(null);
  const fmt = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(2)}M` : n >= 1000 ? n.toLocaleString() : n;
  const fmtNGN = (n) => `₦${(n/1000000).toFixed(1)}M`;

  return (
    <div style={{ padding: "0 0 80px" }}>
      {/* Hero stat */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "20px 16px 24px", color: C.white }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: C.gold, textTransform: "uppercase", marginBottom: 2 }}>Total Enrolled Students</div>
        <div style={{ fontSize: 42, fontWeight: 800, color: C.white, lineHeight: 1 }}>{dashData.enrolment.total.toLocaleString()}</div>
        <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>Academic Session 2024/2025</div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {[
            { label: "Fee Collection", value: `${dashData.fees.pct}%`, color: C.green },
            { label: "At-Risk Students", value: dashData.atRisk.total, color: C.red },
            { label: "Active Grants", value: dashData.research.activeGrants, color: C.gold },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: C.slate, lineHeight: 1.3, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 12px 0" }}>

        {/* Enrolment by Faculty */}
        <Card>
          <SectionLabel>Enrolment by Faculty</SectionLabel>
          {dashData.enrolment.byFaculty.map(f => (
            <div key={f.name} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: C.text }}>{f.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{f.count.toLocaleString()}</span>
              </div>
              <Bar pct={f.pct * 4} color={C.gold} height={5} />
            </div>
          ))}
        </Card>

        {/* Fee Collection */}
        <Card>
          <SectionLabel>Fee Collection Status</SectionLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <Ring pct={dashData.fees.pct} size={80} stroke={9} color={dashData.fees.pct >= 80 ? C.green : C.gold} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: C.textSoft }}>Collected</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.green }}>{fmtNGN(dashData.fees.collected)}</div>
              <div style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}>Outstanding: <span style={{ color: C.red, fontWeight: 700 }}>{fmtNGN(dashData.fees.outstanding)}</span></div>
            </div>
          </div>
          <StatRow label="Target (Session)" value={fmtNGN(dashData.fees.target)} />
          <StatRow label="Likely Defaulters (AI)" value={dashData.fees.topDefaulters} color={C.amber} />
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: C.slate, marginBottom: 5 }}>Weekly Collection Trend</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 36 }}>
              {dashData.fees.trend.map((v, i) => (
                <div key={i} style={{ flex: 1, height: `${v}%`, background: i === dashData.fees.trend.length - 1 ? C.gold : C.border, borderRadius: "3px 3px 0 0", transition: "height 1s ease" }} />
              ))}
            </div>
          </div>
        </Card>

        {/* Research & Alumni */}
        <div style={{ display: "flex", gap: 10 }}>
          <Card style={{ flex: 1, marginBottom: 12 }}>
            <SectionLabel>Research</SectionLabel>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.navy }}>{dashData.research.activeGrants}</div>
            <div style={{ fontSize: 11, color: C.textSoft }}>Active Grants</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginTop: 6 }}>{fmt(dashData.research.totalValue)}</div>
            <div style={{ fontSize: 11, color: C.textSoft }}>Total Value</div>
            <div style={{ marginTop: 8 }}><Badge label={`${dashData.research.upcomingDeadlines} Deadlines Soon`} color={C.amber} bg={C.amberLight} /></div>
          </Card>
          <Card style={{ flex: 1, marginBottom: 12 }}>
            <SectionLabel>Alumni</SectionLabel>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.navy }}>{(dashData.alumni.registered/1000).toFixed(1)}k</div>
            <div style={{ fontSize: 11, color: C.textSoft }}>Registered Alumni</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginTop: 6 }}>${dashData.alumni.raised.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: C.textSoft }}>Funds Raised (YTD)</div>
            <div style={{ marginTop: 8 }}><Badge label={`${dashData.alumni.donors} Donors`} color={C.green} bg={C.greenLight} /></div>
          </Card>
        </div>

        {/* Ranking indicators */}
        <Card>
          <SectionLabel>NUC Ranking Indicators</SectionLabel>
          <StatRow label="Research Publications (12 mo)" value={dashData.ranking.publications} />
          <StatRow label="Total Citations" value={dashData.ranking.citations} />
          <StatRow label="International Partnerships" value={dashData.ranking.intlPartnerships} />
        </Card>

      </div>
    </div>
  );
};

// AI STUDENT SUCCESS ENGINE
const StudentSuccess = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ padding: "0 0 80px" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "20px 16px 24px", color: C.white }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>AI Student Success Engine</div>
        <div style={{ fontSize: 14, color: C.slate }}>Real-time dropout & failure risk prediction</div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {[
            { label: "Critical Risk", value: dashData.atRisk.critical, color: C.red, bg: C.redLight },
            { label: "Moderate Risk", value: dashData.atRisk.moderate, color: C.amber, bg: C.amberLight },
            { label: "Watch", value: dashData.atRisk.watch, color: C.gold, bg: C.goldPale },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: C.textSoft, lineHeight: 1.3, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 12px 0" }}>
        <Card>
          <SectionLabel>Risk Factors — How AI Scores Students</SectionLabel>
          {[
            { label: "Lecture Attendance", weight: 30 },
            { label: "CA Submission Rate", weight: 25 },
            { label: "Fee Payment Status", weight: 20 },
            { label: "CA Score Average", weight: 15 },
            { label: "Hostel / Welfare Flags", weight: 10 },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: C.text }}>{f.label}</span>
                <span style={{ fontSize: 11, color: C.slate }}>{f.weight}% weight</span>
              </div>
              <Bar pct={f.weight * 3} color={C.gold} height={5} />
            </div>
          ))}
        </Card>

        <SectionLabel>At-Risk Students — Semester View</SectionLabel>
        {atRiskStudents.map(s => (
          <Card key={s.id} style={{ cursor: "pointer", border: selected?.id === s.id ? `2px solid ${C.gold}` : `1px solid ${C.border}` }}
            onClick={() => setSelected(selected?.id === s.id ? null : s)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.slate }}>{s.id} · {s.faculty}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.risk >= 80 ? C.red : s.risk >= 65 ? C.amber : C.gold }}>{s.risk}<span style={{ fontSize: 11, fontWeight: 400 }}>/100</span></div>
                <RiskBadge score={s.risk} />
              </div>
            </div>
            {selected?.id === s.id && (
              <div style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.slate, marginBottom: 6 }}>RISK FACTORS IDENTIFIED</div>
                {s.issues.map((issue, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5 }}>
                    <span style={{ color: C.red, fontSize: 12, marginTop: 1 }}>⚠</span>
                    <span style={{ fontSize: 12, color: C.text }}>{issue}</span>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button style={{ flex: 1, background: C.navy, border: "none", borderRadius: 8, padding: "8px", fontSize: 11, fontWeight: 700, color: C.white, cursor: "pointer" }}>📱 WhatsApp Student</button>
                  <button style={{ flex: 1, background: C.goldPale, border: `1px solid ${C.gold}`, borderRadius: 8, padding: "8px", fontSize: 11, fontWeight: 700, color: C.navy, cursor: "pointer" }}>📋 Assign Counsellor</button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

// WHATSAPP ADMISSIONS CHATBOT
const WhatsApp = () => {
  const { messages, input, setInput, send, loading, online } = useAIChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      {/* WA Header */}
      <div style={{ background: "#075E54", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎓</div>
        <div>
          <div style={{ color: C.white, fontSize: 14, fontWeight: 700 }}>EUL Admissions AI</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>{online ? "● Online — AI-powered responses" : "● Offline — cached responses"}</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.1)", padding: "3px 8px", borderRadius: 99 }}>
          {online ? "🤖 Live AI" : "📦 Offline"}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, background: "#ECE5DD", padding: "12px", overflowY: "auto" }}>
        <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: 8, padding: "8px 12px", textAlign: "center", fontSize: 11, color: "#4A4A4A", marginBottom: 12 }}>
          shikshaAI WhatsApp Admissions Bot · 24/7 · All queries answered instantly
        </div>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
            <div style={{
              maxWidth: "80%", background: m.from === "user" ? "#DCF8C6" : C.white,
              borderRadius: m.from === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
              padding: "10px 13px", fontSize: 13, color: C.text,
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)", lineHeight: 1.5
            }}>
              {m.text}
              <div style={{ fontSize: 10, color: "#8E8E8E", marginTop: 3, textAlign: "right" }}>
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {m.from === "user" ? "✓✓" : ""}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
            <div style={{ background: C.white, borderRadius: "14px 14px 14px 2px", padding: "12px 16px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#B0B0B0", animation: `bounce 1.2s ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      <div style={{ background: "#F0F0F0", padding: "8px 12px", display: "flex", gap: 6, overflowX: "auto", flexShrink: 0 }}>
        {["What courses do you offer?", "What is the JAMB cutoff?", "How do I apply?", "When is the deadline?"].map(q => (
          <button key={q} onClick={() => send(q)} style={{ whiteSpace: "nowrap", background: C.white, border: `1px solid ${C.border}`, borderRadius: 99, padding: "5px 12px", fontSize: 11, color: "#075E54", fontWeight: 600, cursor: "pointer" }}>{q}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ background: "#F0F0F0", padding: "8px 12px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder="Type a message…"
          style={{ flex: 1, border: "none", borderRadius: 24, padding: "10px 16px", fontSize: 13, outline: "none", background: C.white }} />
        <button onClick={() => send(input)} style={{ width: 42, height: 42, borderRadius: 21, background: "#075E54", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: C.white, fontSize: 18 }}>➤</span>
        </button>
      </div>
    </div>
  );
};

// EXAMINATION MODULE
const Examination = () => {
  const [tab, setTab] = useState("admit");
  const tabs = [
    { id: "admit", label: "Admit Cards" },
    { id: "centres", label: "Exam Centres" },
    { id: "results", label: "Results" },
  ];

  return (
    <div style={{ padding: "0 0 80px" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "20px 16px 16px", color: C.white }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Examination Management</div>
        <div style={{ fontSize: 13, color: C.slate }}>{examData.session}</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: C.white, borderBottom: `1px solid ${C.border}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "12px 4px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? C.gold : C.slate, borderBottom: tab === t.id ? `2px solid ${C.gold}` : "none" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "14px 12px 0" }}>

        {tab === "admit" && (
          <>
            <Card>
              <SectionLabel>Admit Card Issuance Status</SectionLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                <Ring pct={Math.round(examData.admitCards.issued / examData.admitCards.total * 100)} size={80} stroke={9} color={C.green} />
                <div style={{ flex: 1 }}>
                  <StatRow label="Total Students" value={examData.admitCards.total.toLocaleString()} />
                  <StatRow label="Admit Cards Issued" value={examData.admitCards.issued.toLocaleString()} color={C.green} />
                  <StatRow label="Pending (Fee Balance)" value={examData.admitCards.pending.toLocaleString()} color={C.red} />
                </div>
              </div>
            </Card>
            <Card>
              <SectionLabel>Admit Card Holds — Reason Breakdown</SectionLabel>
              {[
                { reason: "Outstanding Fees", count: 612, pct: 66 },
                { reason: "Missing O'Level Upload", count: 178, pct: 19 },
                { reason: "Incomplete Registration", count: 89, pct: 10 },
                { reason: "Disciplinary Hold", count: 41, pct: 5 },
              ].map(r => (
                <div key={r.reason} style={{ marginBottom: 9 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: C.text }}>{r.reason}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.red }}>{r.count}</span>
                  </div>
                  <Bar pct={r.pct} color={r.pct > 50 ? C.red : C.amber} height={5} />
                </div>
              ))}
              <button style={{ width: "100%", marginTop: 8, background: C.navy, border: "none", borderRadius: 8, padding: "10px", fontSize: 12, fontWeight: 700, color: C.white, cursor: "pointer" }}>
                📱 Send WhatsApp Reminders to All 920 Students
              </button>
            </Card>
          </>
        )}

        {tab === "centres" && (
          <>
            <Card>
              <SectionLabel>Examination Centres — Seat Allocation</SectionLabel>
              {examData.centres.map(c => {
                const pct = Math.round(c.allocated / c.capacity * 100);
                return (
                  <div key={c.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.name}</span>
                      <span style={{ fontSize: 12, color: C.slate }}>{c.allocated}/{c.capacity} seats</span>
                    </div>
                    <Bar pct={pct} color={pct > 90 ? C.red : pct > 75 ? C.amber : C.green} height={7} />
                    <div style={{ fontSize: 10, color: C.slate, marginTop: 2 }}>{c.capacity - c.allocated} seats available · {pct}% occupied</div>
                  </div>
                );
              })}
            </Card>
            <Card>
              <SectionLabel>Invigilator Assignment</SectionLabel>
              <StatRow label="Invigilators Required" value={Math.ceil(examData.centres.reduce((a,c)=>a+c.allocated,0)/25)} />
              <StatRow label="Assigned" value={Math.ceil(examData.centres.reduce((a,c)=>a+c.allocated,0)/25) - 3} color={C.green} />
              <StatRow label="Still Needed" value={3} color={C.red} />
              <button style={{ width: "100%", marginTop: 10, background: C.navyMid, border: "none", borderRadius: 8, padding: "10px", fontSize: 12, fontWeight: 700, color: C.white, cursor: "pointer" }}>
                📋 Download Seating Plan PDF
              </button>
            </Card>
          </>
        )}

        {tab === "results" && (
          <>
            <Card>
              <SectionLabel>Result Tabulation Status</SectionLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                <Ring pct={Math.round(examData.results.processed / examData.admitCards.total * 100)} size={80} stroke={9} color={C.gold} />
                <div style={{ flex: 1 }}>
                  <StatRow label="Scripts Processed" value={examData.results.processed.toLocaleString()} color={C.green} />
                  <StatRow label="Awaiting Processing" value={examData.results.pending.toLocaleString()} color={C.amber} />
                  <StatRow label="Results Published" value={examData.results.published.toLocaleString()} color={C.navy} />
                </div>
              </div>
            </Card>
            <Card>
              <SectionLabel>Grade Distribution (Published Results)</SectionLabel>
              {[
                { grade: "Distinction (70–100%)", count: examData.results.distinctions, color: C.green },
                { grade: "Credit (60–69%)", count: examData.results.credits, color: C.gold },
                { grade: "Pass (50–59%)", count: examData.results.passes, color: C.amber },
                { grade: "Fail (Below 50%)", count: examData.results.fails, color: C.red },
                { grade: "Absent", count: examData.results.absent, color: C.slate },
              ].map(g => {
                const total = examData.results.published;
                return (
                  <div key={g.grade} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 12, color: C.text }}>{g.grade}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: g.color }}>{g.count.toLocaleString()}</span>
                    </div>
                    <Bar pct={Math.round(g.count / total * 100)} color={g.color} height={5} />
                  </div>
                );
              })}
            </Card>
            <Card>
              <SectionLabel>Senate Result Register — Actions</SectionLabel>
              {[
                { label: "📊 Download Full Tabulation Register", action: "XLSX" },
                { label: "📄 Generate Senate Report PDF", action: "PDF" },
                { label: "📱 Notify Students via WhatsApp", action: "SEND" },
                { label: "🌐 Publish to Student Portal", action: "PUBLISH" },
              ].map(a => (
                <button key={a.label} style={{ width: "100%", marginBottom: 8, background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 14px", fontSize: 12, fontWeight: 600, color: C.navy, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {a.label}
                  <Badge label={a.action} color={C.navy} bg={C.goldPale} />
                </button>
              ))}
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

// ── COVER / HOME SCREEN (permanent, always accessible) ────────
const CoverScreen = ({ onNavigate }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => { setTimeout(() => setReady(true), 200); }, []);

  const modules = [
    { icon: "📊", label: "VC Dashboard", tab: "dash", desc: "Live institutional overview" },
    { icon: "🧠", label: "AI Student Engine", tab: "ai", desc: "Dropout & failure prediction" },
    { icon: "💬", label: "Admissions Bot", tab: "wa", desc: "WhatsApp AI chatbot" },
    { icon: "📝", label: "Examinations", tab: "exam", desc: "Admit cards to results" },
  ];

  return (
    <div style={{
      minHeight: "calc(100vh - 56px)",
      background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 55%, #0D2847 100%)`,
      display: "flex", flexDirection: "column", padding: "0 0 80px"
    }}>
      {/* Hero */}
      <div style={{
        opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.5s ease", textAlign: "center", padding: "36px 24px 28px"
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 22,
          background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 18px", boxShadow: `0 10px 36px rgba(232,160,32,0.45)`
        }}>
          <span style={{ fontSize: 40 }}>🎓</span>
        </div>

        <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
          Intelligent University Management
        </div>
        <div style={{ color: C.white, fontSize: 32, fontWeight: 800, lineHeight: 1.1, marginBottom: 4 }}>
          shiksha<span style={{ color: C.gold }}>AI</span>
        </div>
        <div style={{ color: C.slate, fontSize: 12, letterSpacing: "0.06em", marginBottom: 28 }}>
          by Finesse Enterprises · Powered by AI
        </div>

        {/* University name card */}
        <div style={{
          background: "rgba(255,255,255,0.07)",
          border: `1px solid rgba(232,160,32,0.35)`,
          borderRadius: 16, padding: "18px 22px", marginBottom: 8
        }}>
          <div style={{ color: C.gold, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
            Demo Institution
          </div>
          <div style={{ color: C.white, fontSize: 19, fontWeight: 800, lineHeight: 1.2 }}>{UNIVERSITY}</div>
          <div style={{ color: C.slate, fontSize: 12, marginTop: 5, fontStyle: "italic" }}>{MOTTO}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14 }}>
            {[
              { val: "12,840", label: "Students" },
              { val: "13", label: "Faculties" },
              { val: "₦4.2M", label: "Fee Target" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ color: C.gold, fontSize: 16, fontWeight: 800 }}>{s.val}</div>
                <div style={{ color: C.slate, fontSize: 10 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ color: C.slate, fontSize: 10, marginBottom: 28 }}>
          All data is illustrative · For demonstration purposes only
        </div>
      </div>

      {/* Module tiles */}
      <div style={{ padding: "0 16px", opacity: ready ? 1 : 0, transition: "opacity 0.6s ease 0.2s" }}>
        <div style={{ color: C.gold, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>
          Tap a Module to Explore
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {modules.map(m => (
            <button key={m.tab} onClick={() => onNavigate(m.tab)}
              style={{
                background: "rgba(255,255,255,0.07)", border: `1px solid rgba(255,255,255,0.12)`,
                borderRadius: 14, padding: "16px 12px", cursor: "pointer", textAlign: "center",
                transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 6
              }}
              onMouseOver={e => e.currentTarget.style.background = "rgba(232,160,32,0.15)"}
              onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
            >
              <span style={{ fontSize: 28 }}>{m.icon}</span>
              <span style={{ color: C.white, fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>{m.label}</span>
              <span style={{ color: C.slate, fontSize: 10, lineHeight: 1.3 }}>{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "24px 24px 0", opacity: ready ? 1 : 0, transition: "opacity 0.6s ease 0.3s" }}>
        <div style={{ color: C.slate, fontSize: 10, lineHeight: 1.6 }}>
          Tunasco India · Market Partner for Anglophone Africa<br />
          contact: binay.dutta@tunasco.com
        </div>
      </div>
    </div>
  );
};

// ── MAIN APP ───────────────────────────────────────────────────
const TABS = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "dash", icon: "📊", label: "Dashboard" },
  { id: "ai", icon: "🧠", label: "AI Engine" },
  { id: "wa", icon: "💬", label: "Admissions" },
  { id: "exam", icon: "📝", label: "Exams" },
];

export default function App() {
  const [tab, setTab] = useState("home");

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: 430, margin: "0 auto", background: C.offWhite, minHeight: "100vh", position: "relative" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      {/* Top bar — hidden on home to let the cover breathe */}
      {tab !== "home" && (
        <div style={{ background: C.navy, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div>
            <div style={{ color: C.white, fontSize: 13, fontWeight: 700, lineHeight: 1 }}>shiksha<span style={{ color: C.gold }}>AI</span></div>
            <div style={{ color: C.slate, fontSize: 10 }}>{UNIVERSITY}</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: navigator.onLine ? C.green : C.slate }} />
            <span style={{ fontSize: 10, color: C.slate }}>{navigator.onLine ? "Live" : "Offline"}</span>
          </div>
        </div>
      )}

      {/* Screen content */}
      <div style={{ overflowY: "auto", height: tab === "home" ? "calc(100vh - 56px)" : "calc(100vh - 112px)" }}>
        {tab === "home" && <CoverScreen onNavigate={setTab} />}
        {tab === "dash" && <Dashboard />}
        {tab === "ai" && <StudentSuccess />}
        {tab === "wa" && <WhatsApp />}
        {tab === "exam" && <Examination />}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: C.white, borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 100 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 2px 8px", border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 8, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? C.gold : C.slate }}>{t.label}</span>
            {tab === t.id && <div style={{ width: 18, height: 2, background: C.gold, borderRadius: 99 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
