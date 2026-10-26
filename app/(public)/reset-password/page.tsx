"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Sparkles, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setValidSession(false);
      } else {
        setValidSession(true);
      }
    };
    check();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষর");
      return;
    }
    if (password !== confirm) {
      setError("পাসওয়ার্ড মিলছে না");
      return;
    }

    setLoading(true);
    const { error: e1 } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (e1) {
      setError(e1.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  };

  if (validSession === null) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "14px", color: "var(--muted)" }}>যাচাই হচ্ছে...</p>
      </main>
    );
  }

  if (!validSession) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: "440px", width: "100%", background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "20px", padding: "40px 28px", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <AlertCircle size={32} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)", marginBottom: "8px" }}>লিংকটি ভুল বা মেয়াদোত্তীর্ণ</h2>
          <p style={{ fontSize: "13.5px", color: "var(--muted)", marginBottom: "22px", lineHeight: 1.7 }}>
            আবার নতুন রিসেট লিংক চান
          </p>
          <Link href="/forgot-password" style={{ display: "inline-block", padding: "12px 24px", borderRadius: "11px", background: "linear-gradient(135deg, #6C63FF, #5A52D5)", color: "white", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
            আবার চেষ্টা করুন
          </Link>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: "440px", width: "100%", background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "20px", padding: "40px 28px", textAlign: "center" }}>
          <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <CheckCircle2 size={36} color="#10b981" />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)", marginBottom: "8px" }}>পাসওয়ার্ড বদলানো হয়েছে!</h2>
          <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>লগইন পেজে নিয়ে যাচ্ছি...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: "440px", width: "100%", background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "20px", padding: "28px 26px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", textDecoration: "none", marginBottom: "22px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)" }}>Social<span style={{ color: "#6C63FF" }}>Market</span></span>
        </Link>

        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", marginBottom: "6px", textAlign: "center" }}>নতুন পাসওয়ার্ড</h1>
        <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", marginBottom: "22px" }}>শক্তিশালী পাসওয়ার্ড দিন</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", fontSize: "13px", color: "#ef4444", marginBottom: "12px" }}>{error}</div>
          )}

          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>নতুন পাসওয়ার্ড</label>
            <div className="search-box" style={inputWrap}>
              <Lock size={15} color="var(--muted)" />
              <input type={showPass ? "text" : "password"} placeholder="কমপক্ষে ৮ অক্ষর" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                {showPass ? <EyeOff size={15} color="var(--muted)" /> : <Eye size={15} color="var(--muted)" />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>কনফার্ম পাসওয়ার্ড</label>
            <div className="search-box" style={inputWrap}>
              <Lock size={15} color="var(--muted)" />
              <input type="password" placeholder="আবার পাসওয়ার্ড দিন" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", fontSize: "14px", opacity: loading ? 0.7 : 1 }}>
            {loading ? "সেভ হচ্ছে..." : <><ShieldCheck size={15} /> পাসওয়ার্ড বদলান</>}
          </button>
        </form>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" };
const inputWrap: React.CSSProperties = { display: "flex", alignItems: "center", gap: "9px", padding: "10px 13px", border: "1.5px solid var(--border-strong)" };
const inputStyle: React.CSSProperties = { flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "13.5px", color: "var(--text)" };
