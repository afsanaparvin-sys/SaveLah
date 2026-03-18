"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup fields
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/Dashboard");
    }, 800);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!signupEmail || !signupPassword || !confirmPassword || !bankAccountId || !bankAccountNumber) {
      setError("Please fill in all fields.");
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/Dashboard");
    }, 800);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
  };

  return (
    <div style={styles.root}>
      {/* Left panel */}
      <div style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.logoMark}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="14" fill="#2DD4BF" />
              <path
                d="M8 16c0-3.314 2.686-6 6-6s6 2.686 6 6"
                stroke="#0F1923"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="14" cy="19" r="2" fill="#0F1923" />
            </svg>
          </div>
          <span style={styles.brandName}>Savelah</span>
        </div>

        <div style={styles.heroText}>
          <p style={styles.tagline}>Every dollar has a destination.</p>
          <p style={styles.sub}>
            Set goals, automate savings, and reach your financial milestones — together.
          </p>
        </div>

        <div style={styles.statsRow}>
          {[
            { label: "Active Users", value: "12,400+" },
            { label: "Goals Created", value: "38,000+" },
            { label: "Total Saved", value: "$4.2M+" },
          ].map((s) => (
            <div key={s.label} style={styles.stat}>
              <span style={styles.statValue}>{s.value}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.right}>
        <div style={styles.card}>
          {/* Tab toggle */}
          <div style={styles.tabs}>
            <button
              onClick={() => switchMode("login")}
              style={{
                ...styles.tab,
                ...(mode === "login" ? styles.tabActive : {}),
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode("signup")}
              style={{
                ...styles.tab,
                ...(mode === "signup" ? styles.tabActive : {}),
              }}
            >
              Create Account
            </button>
          </div>

          {/* LOGIN FORM */}
          {mode === "login" && (
            <>
              <h1 style={styles.heading}>Welcome back</h1>
              <p style={styles.cardSub}>Sign in to your account</p>

              <form onSubmit={handleLogin} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    style={styles.input}
                    autoComplete="email"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={styles.input}
                    autoComplete="current-password"
                  />
                </div>

                {error && <p style={styles.error}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.btn,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p style={styles.footer}>
                Don&apos;t have an account?{" "}
                <span style={styles.link} onClick={() => switchMode("signup")}>
                  Create one
                </span>
              </p>
            </>
          )}

          {/* SIGNUP FORM */}
          {mode === "signup" && (
            <>
              <h1 style={styles.heading}>Create account</h1>
              <p style={styles.cardSub}>Get started with Savelah</p>

              <form onSubmit={handleSignup} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="john@example.com"
                    style={styles.input}
                    autoComplete="email"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    style={styles.input}
                    autoComplete="new-password"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={styles.input}
                    autoComplete="new-password"
                  />
                </div>

                <div style={styles.divider}>
                  <span style={styles.dividerText}>Bank Details</span>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Bank Account ID</label>
                  <input
                    type="text"
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    placeholder="e.g. ACC-00123"
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Bank Account Number</label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="e.g. 123456789"
                    style={styles.input}
                  />
                </div>

                {error && <p style={styles.error}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.btn,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <p style={styles.footer}>
                Already have an account?{" "}
                <span style={styles.link} onClick={() => switchMode("login")}>
                  Sign in
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },

  // Left — dark panel
  left: {
    flex: 1,
    background: "#0F1923",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "48px 56px",
    color: "#fff",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoMark: {
    display: "flex",
    alignItems: "center",
  },
  brandName: {
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "-0.3px",
    color: "#fff",
  },
  heroText: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    maxWidth: "420px",
  },
  tagline: {
    fontSize: "42px",
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: "-0.5px",
    color: "#fff",
    margin: "0 0 16px 0",
  },
  sub: {
    fontSize: "16px",
    color: "#8B9EB0",
    lineHeight: 1.6,
    margin: 0,
  },
  statsRow: {
    display: "flex",
    gap: "40px",
    borderTop: "1px solid #1E2D3D",
    paddingTop: "32px",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statValue: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#2DD4BF",
  },
  statLabel: {
    fontSize: "12px",
    color: "#6B7F8E",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  // Right — light panel
  right: {
    width: "480px",
    background: "#F8FAFB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
    overflowY: "auto",
  },
  card: {
    width: "100%",
    maxWidth: "360px",
  },

  // Tabs
  tabs: {
    display: "flex",
    background: "#EDF0F2",
    borderRadius: "10px",
    padding: "4px",
    marginBottom: "28px",
    gap: "4px",
  },
  tab: {
    flex: 1,
    padding: "9px",
    borderRadius: "7px",
    border: "none",
    background: "transparent",
    fontSize: "14px",
    fontWeight: 600,
    color: "#6B7F8E",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  tabActive: {
    background: "#fff",
    color: "#0F1923",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },

  heading: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#0F1923",
    margin: "0 0 6px 0",
    letterSpacing: "-0.3px",
  },
  cardSub: {
    fontSize: "15px",
    color: "#6B7F8E",
    margin: "0 0 28px 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "11px 14px",
    borderRadius: "8px",
    border: "1.5px solid #D1D9E0",
    fontSize: "15px",
    background: "#fff",
    color: "#0F1923",
    outline: "none",
    transition: "border-color 0.15s",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "4px 0",
  },
  dividerText: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#6B7F8E",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
    borderTop: "1px solid #D1D9E0",
    paddingTop: "12px",
    width: "100%",
  },
  error: {
    fontSize: "13px",
    color: "#EF4444",
    margin: "0",
    background: "#FEF2F2",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #FECACA",
  },
  btn: {
    marginTop: "4px",
    padding: "13px",
    borderRadius: "8px",
    background: "#2DD4BF",
    color: "#0F1923",
    fontWeight: 700,
    fontSize: "15px",
    border: "none",
    transition: "background 0.15s",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "13px",
    color: "#6B7F8E",
  },
  link: {
    color: "#2DD4BF",
    fontWeight: 600,
    cursor: "pointer",
  },
};