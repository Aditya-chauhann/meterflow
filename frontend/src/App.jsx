import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const API_BASE = "https://meterflow-production.up.railway.app";

const COLORS = {
  bg: "#080808", surface: "#0f0f0f", card: "#141414",
  border: "#1e1e1e", borderHover: "#2a2a2a",
  accent: "#00ff87", accentDim: "#00ff8722", accentMid: "#00ff8744",
  blue: "#4f8ef7", blueDim: "#4f8ef722",
  amber: "#f5a623", amberDim: "#f5a62322",
  red: "#ff4d4d",
  textPrimary: "#f0f0f0", textSecondary: "#888", textTertiary: "#444",
  mono: "'DM Mono', monospace",
};

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${COLORS.bg}; color: ${COLORS.textPrimary}; font-family: 'DM Sans', sans-serif; min-height: 100vh; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .fade-up { animation: fadeUp 0.5s ease forwards; }
  .fade-up-1 { animation: fadeUp 0.5s 0.05s ease both; }
  .fade-up-2 { animation: fadeUp 0.5s 0.1s ease both; }
  .fade-up-3 { animation: fadeUp 0.5s 0.15s ease both; }
  .fade-up-4 { animation: fadeUp 0.5s 0.2s ease both; }
  .fade-up-5 { animation: fadeUp 0.5s 0.25s ease both; }
  .skeleton { background: linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: ${COLORS.accent}; animation: pulse 2s infinite; display: inline-block; }
  input, button, select { font-family: 'DM Sans', sans-serif; }
  .key-badge { font-family: ${COLORS.mono}; font-size: 11px; background: #0a0a0a; border: 1px solid ${COLORS.border}; border-radius: 4px; padding: 2px 8px; color: ${COLORS.accent}; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .copy-btn { background: none; border: none; color: ${COLORS.textSecondary}; cursor: pointer; padding: 4px; border-radius: 4px; transition: color 0.2s; display: flex; align-items: center; }
  .copy-btn:hover { color: ${COLORS.textPrimary}; }
  .action-btn { background: ${COLORS.accent}; color: #000; border: none; border-radius: 8px; padding: 10px 20px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; justify-content: center; }
  .action-btn:hover { background: #00e87a; transform: translateY(-1px); }
  .action-btn:active { transform: translateY(0); }
  .action-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .text-input { background: #0a0a0a; border: 1px solid ${COLORS.border}; border-radius: 8px; color: ${COLORS.textPrimary}; font-size: 13px; padding: 10px 14px; width: 100%; outline: none; transition: border-color 0.2s; }
  .text-input:focus { border-color: ${COLORS.accentMid}; }
  .text-input::placeholder { color: ${COLORS.textTertiary}; }
  .card { background: ${COLORS.card}; border: 1px solid ${COLORS.border}; border-radius: 12px; transition: border-color 0.2s; }
  .card:hover { border-color: ${COLORS.borderHover}; }
  .stat-number { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 32px; letter-spacing: -0.02em; line-height: 1; }
  .nav-link { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; color: ${COLORS.textSecondary}; font-size: 13px; cursor: pointer; transition: all 0.2s; border: none; background: none; width: 100%; text-align: left; font-family: 'DM Sans', sans-serif; }
  .nav-link:hover { color: ${COLORS.textPrimary}; background: #141414; }
  .nav-link.active { color: ${COLORS.textPrimary}; background: #181818; }
  .tooltip-box { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 10px 14px; font-size: 12px; }
  .plan-badge { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 8px; border-radius: 4px; }
  .plan-free { background: ${COLORS.accentDim}; color: ${COLORS.accent}; }
  .plan-pro { background: ${COLORS.blueDim}; color: ${COLORS.blue}; }
  .plan-enterprise { background: ${COLORS.amberDim}; color: ${COLORS.amber}; }
  .notification { position: fixed; top: 24px; right: 24px; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 10px; padding: 14px 18px; font-size: 13px; z-index: 1000; display: flex; align-items: center; gap: 10px; animation: fadeUp 0.3s ease; max-width: 320px; }

  .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: ${COLORS.bg}; position: relative; overflow: hidden; }
  .auth-page::before { content: ''; position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, ${COLORS.accentDim} 0%, transparent 70%); top: -200px; left: -200px; pointer-events: none; }
  .auth-page::after { content: ''; position: absolute; width: 400px; height: 400px; background: radial-gradient(circle, #4f8ef711 0%, transparent 70%); bottom: -100px; right: -100px; pointer-events: none; }
  .auth-card { width: 100%; max-width: 400px; background: ${COLORS.card}; border: 1px solid ${COLORS.border}; border-radius: 16px; padding: 40px; position: relative; z-index: 1; animation: fadeUp 0.5s ease; }
  .auth-tab { flex: 1; padding: 8px; background: none; border: none; color: ${COLORS.textSecondary}; font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
  .auth-tab.active { background: ${COLORS.border}; color: ${COLORS.textPrimary}; }
  .divider { height: 1px; background: ${COLORS.border}; margin: 20px 0; }
`;

const Icon = ({ d, size = 16, color = "currentColor", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  billing: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-4H9l3-3 3 3h-2v4z",
  analytics: "M18 20V10M12 20V4M6 20v-6",
  copy: "M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-2 M16 4h2a2 2 0 012 2v4 M8 4a2 2 0 012-2h4a2 2 0 012 2v4H8V4z",
  plus: "M12 5v14M5 12h14",
  check: "M20 6L9 17l-5-5",
  alert: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4M12 17h.01",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-box">
      <p style={{ color: COLORS.textSecondary, marginBottom: 4, fontSize: 11 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 500 }}>
          {p.name}: {typeof p.value === "number" && p.value < 1 ? `$${p.value.toFixed(4)}` : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Auth Page ────────────────────────────────────────────────────────────────
const AuthPage = ({ onLogin }) => {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const url = tab === "login" ? `${API_BASE}/auth/login` : `${API_BASE}/auth/signup`;
      const body = tab === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Something went wrong"); setLoading(false); return; }
      localStorage.setItem("mf_token", data.token);
      localStorage.setItem("mf_name", data.name || form.name);
      localStorage.setItem("mf_email", data.email || form.email);
      onLogin(data);
    } catch {
      setError("Cannot connect to server — is the backend running?");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.accent}, #00bfff)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#000" /></svg>
          </div>
          <div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>MeterFlow</p>
            <p style={{ fontSize: 10, color: COLORS.textSecondary, letterSpacing: "0.04em" }}>API BILLING PLATFORM</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#0a0a0a", borderRadius: 8, padding: 4, marginBottom: 28 }}>
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>Sign In</button>
          <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => { setTab("signup"); setError(""); }}>Create Account</button>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tab === "signup" && (
            <div>
              <label style={{ fontSize: 11, color: COLORS.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Full Name</label>
              <input className="text-input" placeholder="Aditya" value={form.name} onChange={e => update("name", e.target.value)} />
            </div>
          )}
          <div>
            <label style={{ fontSize: 11, color: COLORS.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</label>
            <input className="text-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => update("email", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: COLORS.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Password</label>
            <input className="text-input" type="password" placeholder="••••••••" value={form.password} onChange={e => update("password", e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "#ff4d4d11", border: "1px solid #ff4d4d44", borderRadius: 8, fontSize: 12, color: COLORS.red }}>{error}</div>
          )}

          <button className="action-btn" onClick={handleSubmit} disabled={loading} style={{ width: "100%", marginTop: 4 }}>
            {loading ? "Please wait..." : tab === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>

        <div className="divider" />
        <p style={{ fontSize: 11, color: COLORS.textTertiary, textAlign: "center" }}>
          {tab === "login" ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: COLORS.accent, cursor: "pointer" }} onClick={() => { setTab(tab === "login" ? "signup" : "login"); setError(""); }}>
            {tab === "login" ? "Sign up" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent, loading, delay = 0 }) => (
  <div className={`card fade-up-${delay + 1}`} style={{ padding: "20px 24px" }}>
    <p style={{ color: COLORS.textSecondary, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>{label}</p>
    {loading ? <div className="skeleton" style={{ height: 32, width: "60%", marginBottom: 8 }} /> : <p className="stat-number" style={{ color: accent || COLORS.textPrimary, marginBottom: 6 }}>{value}</p>}
    {loading ? <div className="skeleton" style={{ height: 14, width: "40%" }} /> : <p style={{ color: COLORS.textSecondary, fontSize: 12 }}>{sub}</p>}
  </div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, user, onLogout }) => {
  const links = [
  { id: "overview", label: "Overview", icon: Icons.dashboard },
  { id: "keys", label: "API Keys", icon: Icons.key },
  { id: "analytics", label: "Analytics", icon: Icons.analytics },
  { id: "billing", label: "Billing", icon: Icons.billing },
  { id: "payment", label: "Payments", icon: Icons.zap },
];

  return (
    <aside style={{ width: 220, minHeight: "100vh", background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 10 }}>
      <div style={{ padding: "28px 20px 24px", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.accent}, #00bfff)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#000" /></svg>
          </div>
          <div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>MeterFlow</p>
            <p style={{ fontSize: 10, color: COLORS.textSecondary, letterSpacing: "0.04em" }}>API BILLING</p>
          </div>
        </div>
      </div>

      {/* User */}
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS.accentDim, border: `1px solid ${COLORS.accentMid}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={Icons.user} size={13} color={COLORS.accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
            <p style={{ fontSize: 10, color: COLORS.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="live-dot" />
          <span style={{ fontSize: 11, color: COLORS.textSecondary }}>All systems operational</span>
        </div>
      </div>

      <nav style={{ padding: "16px 12px", flex: 1 }}>
        <p style={{ fontSize: 10, color: COLORS.textTertiary, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, paddingLeft: 12 }}>Navigation</p>
        {links.map(link => (
          <button key={link.id} className={`nav-link ${active === link.id ? "active" : ""}`} onClick={() => setActive(link.id)}>
            <Icon d={link.icon} size={15} color={active === link.id ? COLORS.accent : COLORS.textSecondary} />
            {link.label}
            {active === link.id && <span style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: COLORS.accent }} />}
          </button>
        ))}
      </nav>

      <div style={{ padding: "16px 12px", borderTop: `1px solid ${COLORS.border}` }}>
        <button className="nav-link" onClick={onLogout}>
          <Icon d={Icons.logout} size={15} color={COLORS.red} />
          <span style={{ color: COLORS.red }}>Sign Out</span>
        </button>
        <p style={{ fontSize: 11, color: COLORS.textTertiary, paddingLeft: 12, marginTop: 8 }}>v1.0.0 · FastAPI + MongoDB</p>
      </div>
    </aside>
  );
};

// ─── Overview ─────────────────────────────────────────────────────────────────
const Overview = ({ data, loading }) => {
  const chartData = data?.requests_per_endpoint
    ? Object.entries(data.requests_per_endpoint).map(([k, v]) => ({ name: k.replace("/", ""), value: v }))
    : [];
  const mockTrend = Array.from({ length: 12 }, (_, i) => ({ hour: `${i * 2}:00`, requests: Math.floor(Math.random() * 40 + 10) }));

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em", marginBottom: 4 }}>Overview</h1>
        <p style={{ color: COLORS.textSecondary, fontSize: 13 }}>Real-time API usage metrics and performance</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        <StatCard label="Total Requests" value={data?.total_requests ?? "—"} sub="All time" accent={COLORS.accent} loading={loading} delay={0} />
        <StatCard label="Avg Response" value={data ? `${data.avg_response_time_ms?.toFixed(0)}ms` : "—"} sub="Mean latency" loading={loading} delay={1} />
        <StatCard label="Error Rate" value={data ? `${data.error_rate_percent}%` : "—"} sub="All endpoints" accent={data?.error_rate_percent > 5 ? COLORS.red : COLORS.accent} loading={loading} delay={2} />
        <StatCard label="Active Keys" value="1" sub="Free tier" loading={loading} delay={3} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        <div className="card fade-up-5" style={{ padding: "24px" }}>
          <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Request Volume</p>
          <p style={{ color: COLORS.textSecondary, fontSize: 12, marginBottom: 20 }}>Simulated 24h trend</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={mockTrend}>
              <defs>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fill: COLORS.textTertiary, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="requests" name="Requests" stroke={COLORS.accent} strokeWidth={2} fill="url(#reqGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card fade-up-5" style={{ padding: "24px" }}>
          <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Endpoints</p>
          <p style={{ color: COLORS.textSecondary, fontSize: 12, marginBottom: 20 }}>Request distribution</p>
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                    {chartData.map((_, i) => <Cell key={i} fill={[COLORS.accent, COLORS.blue, COLORS.amber, "#a78bfa"][i % 4]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                {chartData.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: [COLORS.accent, COLORS.blue, COLORS.amber, "#a78bfa"][i % 4], flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: COLORS.mono }}>/{d.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.textTertiary, fontSize: 13 }}>No endpoint data</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── API Keys ─────────────────────────────────────────────────────────────────
const ApiKeys = ({ notify }) => {
  const [userId, setUserId] = useState("");
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [keys, setKeys] = useState([]);
  const [copied, setCopied] = useState(false);

  const generateKey = async () => {
    if (!userId.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/keys/generate?user_id=${userId}&plan=${plan}`, { method: "POST" });
      const data = await res.json();
      setGeneratedKey(data.api_key);
      setKeys(prev => [{ key: data.api_key, user_id: userId, plan, created: new Date().toISOString() }, ...prev]);
      notify("API key generated successfully", "success");
    } catch { notify("Failed to generate key", "error"); }
    setLoading(false);
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    notify("Copied to clipboard", "success");
  };

  const revokeKey = async (key) => {
    try {
      const res = await fetch(`${API_BASE}/keys/revoke/${key}`, { method: "PATCH" });
      const data = await res.json();
      if (data.message) { setKeys(prev => prev.filter(k => k.key !== key)); notify("Key revoked", "success"); }
    } catch { notify("Failed to revoke key", "error"); }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em", marginBottom: 4 }}>API Keys</h1>
        <p style={{ color: COLORS.textSecondary, fontSize: 13 }}>Generate and manage access credentials</p>
      </div>
      <div className="card fade-up-1" style={{ padding: "28px", marginBottom: 20, borderColor: COLORS.accentMid }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Icon d={Icons.zap} size={16} color={COLORS.accent} />
          <p style={{ fontWeight: 500, fontSize: 14 }}>Generate New Key</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px auto", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: COLORS.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>User ID</label>
            <input className="text-input" placeholder="e.g. aditya" value={userId} onChange={e => setUserId(e.target.value)} onKeyDown={e => e.key === "Enter" && generateKey()} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: COLORS.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Plan</label>
            <select className="text-input" value={plan} onChange={e => setPlan(e.target.value)} style={{ cursor: "pointer" }}>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="action-btn" onClick={generateKey} disabled={loading || !userId.trim()}>
              <Icon d={Icons.plus} size={14} color="#000" />
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
        {generatedKey && (
          <div style={{ marginTop: 20, padding: "14px 16px", background: COLORS.accentDim, border: `1px solid ${COLORS.accentMid}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 11, color: COLORS.accent, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>New key generated</p>
              <code style={{ fontFamily: COLORS.mono, fontSize: 13, color: COLORS.textPrimary }}>{generatedKey}</code>
            </div>
            <button className="copy-btn" onClick={() => copyKey(generatedKey)}>
              <Icon d={copied ? Icons.check : Icons.copy} size={16} color={copied ? COLORS.accent : COLORS.textSecondary} />
            </button>
          </div>
        )}
      </div>
      <div className="card fade-up-2">
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontWeight: 500, fontSize: 14 }}>Generated This Session</p>
          <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{keys.length} keys</span>
        </div>
        {keys.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: COLORS.textTertiary, fontSize: 13 }}>No keys generated yet</div>
        ) : (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 140px 80px", padding: "10px 24px", borderBottom: `1px solid ${COLORS.border}` }}>
              {["Key", "Plan", "Created", ""].map(h => <span key={h} style={{ fontSize: 11, color: COLORS.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>)}
            </div>
            {keys.map((k, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 140px 80px", padding: "14px 24px", borderBottom: i < keys.length - 1 ? `1px solid ${COLORS.border}` : "none", alignItems: "center" }}>
                <span className="key-badge">{k.key}</span>
                <span className={`plan-badge plan-${k.plan}`}>{k.plan}</span>
                <span style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: COLORS.mono }}>{new Date(k.created).toLocaleTimeString()}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="copy-btn" onClick={() => copyKey(k.key)}><Icon d={Icons.copy} size={14} /></button>
                  <button className="copy-btn" onClick={() => revokeKey(k.key)}><Icon d={Icons.alert} size={14} color={COLORS.red} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Analytics ────────────────────────────────────────────────────────────────
const Analytics = ({ notify }) => {
  const [apiKey, setApiKey] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch_ = async () => {
    if (!apiKey.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/analytics/${apiKey}`, { headers: { "x-api-key": apiKey } });
      setData(await res.json());
    } catch { notify("Failed to fetch analytics", "error"); }
    setLoading(false);
  };

  const endpointData = data?.requests_per_endpoint
    ? Object.entries(data.requests_per_endpoint).map(([k, v]) => ({ endpoint: k, count: v }))
    : [];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em", marginBottom: 4 }}>Analytics</h1>
        <p style={{ color: COLORS.textSecondary, fontSize: 13 }}>Per-key usage breakdown and performance metrics</p>
      </div>
      <div className="card fade-up-1" style={{ padding: "20px 24px", marginBottom: 20 }}>
        <label style={{ fontSize: 11, color: COLORS.textSecondary, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>API Key</label>
        <div style={{ display: "flex", gap: 10 }}>
          <input className="text-input" placeholder="Enter your API key" value={apiKey} onChange={e => setApiKey(e.target.value)} onKeyDown={e => e.key === "Enter" && fetch_()} style={{ fontFamily: COLORS.mono, fontSize: 12 }} />
          <button className="action-btn" onClick={fetch_} disabled={loading || !apiKey.trim()}>
            <Icon d={Icons.analytics} size={14} color="#000" />
            {loading ? "Loading..." : "Analyze"}
          </button>
        </div>
      </div>
      {data && !data.error && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            <StatCard label="Total Requests" value={data.total_requests} sub="All time" accent={COLORS.accent} />
            <StatCard label="Avg Response" value={`${data.avg_response_time_ms?.toFixed(0)}ms`} sub="Mean latency" />
            <StatCard label="Error Rate" value={`${data.error_rate_percent}%`} sub="4xx + 5xx" accent={data.error_rate_percent > 5 ? COLORS.red : COLORS.accent} />
          </div>
          <div className="card fade-up-3" style={{ padding: "24px" }}>
            <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Requests by Endpoint</p>
            <p style={{ color: COLORS.textSecondary, fontSize: 12, marginBottom: 20 }}>Hit count per route</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={endpointData} barSize={32}>
                <XAxis dataKey="endpoint" tick={{ fill: COLORS.textSecondary, fontSize: 11, fontFamily: COLORS.mono }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Requests" radius={[4, 4, 0, 0]}>
                  {endpointData.map((_, i) => <Cell key={i} fill={i === 0 ? COLORS.accent : COLORS.blue} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
      {data?.error && <div className="card fade-up-2" style={{ padding: "32px", textAlign: "center", color: COLORS.red, fontSize: 13 }}>{data.error}</div>}
    </div>
  );
};

// ─── Billing ──────────────────────────────────────────────────────────────────
const Billing = ({ notify }) => {
  const [userId, setUserId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBilling = async () => {
    if (!userId.trim() || !apiKey.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/billing/${userId}`, { headers: { "x-api-key": apiKey } });
      setData(await res.json());
    } catch { notify("Failed to fetch billing", "error"); }
    setLoading(false);
  };

  const PRICING = { free: 0.001, pro: 0.0005, enterprise: 0.0001 };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em", marginBottom: 4 }}>Billing</h1>
        <p style={{ color: COLORS.textSecondary, fontSize: 13 }}>Usage-based cost breakdown by API key</p>
      </div>
      <div className="card fade-up-1" style={{ padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: COLORS.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>User ID</label>
            <input className="text-input" placeholder="e.g. aditya" value={userId} onChange={e => setUserId(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: COLORS.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Auth Key</label>
            <input className="text-input" placeholder="Your API key" value={apiKey} onChange={e => setApiKey(e.target.value)} style={{ fontFamily: COLORS.mono, fontSize: 12 }} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="action-btn" onClick={fetchBilling} disabled={loading || !userId.trim() || !apiKey.trim()}>
              <Icon d={Icons.billing} size={14} color="#000" />
              {loading ? "Loading..." : "Get Bill"}
            </button>
          </div>
        </div>
      </div>
      <div className="card fade-up-2" style={{ padding: "24px", marginBottom: 20 }}>
        <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 16 }}>Pricing Tiers</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {Object.entries(PRICING).map(([plan, price]) => (
            <div key={plan} style={{ padding: "16px 20px", background: plan === "pro" ? COLORS.blueDim : "#0a0a0a", border: `1px solid ${plan === "pro" ? COLORS.blue + "44" : COLORS.border}`, borderRadius: 10 }}>
              <span className={`plan-badge plan-${plan}`} style={{ marginBottom: 12, display: "inline-block" }}>{plan}</span>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 22 }}>${price.toFixed(4)}</p>
              <p style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>per request</p>
            </div>
          ))}
        </div>
      </div>
      {data && !data.error && (
        <div className="card fade-up-3">
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontWeight: 500, fontSize: 14 }}>Invoice — {data.user_id}</p>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 }}>Total Due</p>
                <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: COLORS.accent }}>${data.total_cost_usd.toFixed(6)}</p>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 120px", padding: "10px 24px", borderBottom: `1px solid ${COLORS.border}` }}>
            {["Key", "Plan", "Requests", "Cost"].map(h => <span key={h} style={{ fontSize: 11, color: COLORS.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>)}
          </div>
          {data.keys?.map((k, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 120px", padding: "14px 24px", borderBottom: i < data.keys.length - 1 ? `1px solid ${COLORS.border}` : "none", alignItems: "center" }}>
              <span className="key-badge">{k.api_key}</span>
              <span className={`plan-badge plan-${k.plan}`}>{k.plan}</span>
              <span style={{ fontSize: 13, fontFamily: COLORS.mono }}>{k.total_requests}</span>
              <span style={{ fontSize: 13, fontFamily: COLORS.mono, color: COLORS.accent }}>${k.cost_usd.toFixed(6)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
const Payment = ({ user, notify }) => {
  const [userId, setUserId] = useState(user?.email || "");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/payment/history/${userId}`);
      const data = await res.json();
      setHistory(data);
    } catch { }
  };

  const handlePay = async () => {
    if (!userId || !amount) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, amount_usd: parseFloat(amount) })
      });
      const order = await res.json();

      const options = {
        key: order.key_id,
        amount: order.amount_paise,
        currency: order.currency,
        name: "MeterFlow",
        description: "API Usage Payment",
        order_id: order.order_id,
        handler: async (response) => {
          const verify = await fetch(`${API_BASE}/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })
          });
          const result = await verify.json();
          if (result.success) {
            notify("Payment successful!", "success");
            fetchHistory();
          } else {
            notify("Payment verification failed", "error");
          }
        },
        prefill: { email: userId },
        theme: { color: "#00ff87" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      notify("Failed to create order", "error");
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em", marginBottom: 4 }}>Payments</h1>
        <p style={{ color: COLORS.textSecondary, fontSize: 13 }}>Pay your API usage bill via Razorpay</p>
      </div>

      <div className="card fade-up-1" style={{ padding: "28px", marginBottom: 20, borderColor: COLORS.accentMid }}>
        <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 20 }}>Make a Payment</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: COLORS.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>User ID / Email</label>
            <input className="text-input" placeholder="aditya@gmail.com" value={userId} onChange={e => setUserId(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: COLORS.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Amount (USD)</label>
            <input className="text-input" placeholder="0.05" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="action-btn" onClick={handlePay} disabled={loading || !userId || !amount}>
              <Icon d={Icons.zap} size={14} color="#000" />
              {loading ? "Loading..." : "Pay Now"}
            </button>
          </div>
        </div>
      </div>

      <div className="card fade-up-2" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontWeight: 500, fontSize: 14 }}>Payment History</p>
          <button className="ghost-btn" onClick={fetchHistory} style={{ fontSize: 12, padding: "6px 12px" }}>Refresh</button>
        </div>
        {history.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: COLORS.textTertiary, fontSize: 13 }}>No payments yet — click Refresh after making a payment</div>
        ) : (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 80px", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}`, marginBottom: 8 }}>
              {["Order ID", "Amount", "INR", "Status"].map(h => (
                <span key={h} style={{ fontSize: 11, color: COLORS.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
              ))}
            </div>
            {history.map((p, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 80px", padding: "12px 0", borderBottom: i < history.length - 1 ? `1px solid ${COLORS.border}` : "none", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontFamily: COLORS.mono, color: COLORS.textSecondary }}>{p.order_id}</span>
                <span style={{ fontSize: 13, fontFamily: COLORS.mono }}>${p.amount_usd}</span>
                <span style={{ fontSize: 13, fontFamily: COLORS.mono }}>₹{(p.amount_paise / 100).toFixed(2)}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: p.status === "paid" ? COLORS.accentDim : COLORS.amberDim, color: p.status === "paid" ? COLORS.accent : COLORS.amber }}>{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("overview");
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("mf_token");
    const name = localStorage.getItem("mf_name");
    const email = localStorage.getItem("mf_email");
    if (token && name) setUser({ token, name, email });
  }, []);

  const notify = useCallback((msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleLogin = (data) => setUser({ token: data.token, name: data.name, email: data.email });

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setPage("overview");
  };

  if (!user) return <><style>{styles}</style><AuthPage onLogin={handleLogin} /></>;

  return (
    <>
      <style>{styles}</style>
      {notification && (
        <div className="notification" style={{ borderColor: notification.type === "error" ? COLORS.red + "44" : COLORS.accentMid }}>
          <Icon d={notification.type === "error" ? Icons.alert : Icons.check} size={16} color={notification.type === "error" ? COLORS.red : COLORS.accent} />
          <span style={{ fontSize: 13 }}>{notification.msg}</span>
        </div>
      )}
      <div style={{ display: "flex" }}>
        <Sidebar active={page} setActive={setPage} user={user} onLogout={handleLogout} />
        <main style={{ marginLeft: 220, flex: 1, padding: "40px 48px", maxWidth: "calc(100vw - 220px)", minHeight: "100vh" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}>
              <Icon d={Icons.eye} size={14} color={COLORS.textSecondary} />
              <span style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: COLORS.mono }}>localhost:8000</span>
              <span className="live-dot" />
            </div>
          </div>
          {page === "overview" && <Overview data={null} loading={false} />}
          {page === "keys" && <ApiKeys notify={notify} />}
          {page === "analytics" && <Analytics notify={notify} />}
          {page === "billing" && <Billing notify={notify} />}
          {page === "payment" && <Payment user={user} notify={notify} />}
        </main>
      </div>
    </>
  );
}