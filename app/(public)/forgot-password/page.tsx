"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Sparkles, KeyRound, CheckCircle2, ArrowLeft, Send, ShieldCheck, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("সঠিক ইমেইল দিন");
      return;
    }

    setLoading(true);
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (resetErr) {
      setError(resetErr.message);
      return;
    }

    setSent(true);
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", padding: "20px 20px 40px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "5%", left: "5%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "5%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(217,70,239,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "460px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", textDecoration: "none", marginBottom: "20px" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(139,92,246,0.4)" }}>
            <Sparkles size={22} color="#fff" />
          </div>
          <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
            Social<span style={{ color: "#6C63FF" }}>Market</span>
          </span>
        </Link>

        <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "20px", padding: "28px 26px", boxShadow: "0 20px 60px -20px rgba(108,99,255,0.25)" }} className="auth-card">
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                <CheckCircle2 size={36} color="#10b981" />
              </div>
              <h2 style={{ fontSize: "21px", fontWeight: 800, color: "var(--text)", marginBottom: "8px", letterSpacing: "-0.02em" }}>
                ইমেইল পাঠানো হয়েছে!
              </h2>
              <p style={{ fontSize: "13.5px", color: "var(--muted)", lineHeight: 1.7, marginBottom: "6px" }}>
                আমরা একটি পাসওয়ার্ড রিসেট লিংক পাঠিয়েছি
              </p>
              <p style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--primary)", marginBottom: "22px", wordBreak: "break-all" }}>
                {email}
              </p>
              <p style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "20px", lineHeight: 1.6 }}>
                ইমেইল পাননি? স্প্যাম ফোল্ডার চেক করুন অথবা{" "}
                <button onClick={() => setSent(false)} style={{ background: "transparent", border: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontSize: "12.5px", padding: 0 }}>
                  আবার চেষ্টা করুন
                </button>
              </p>
              <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "11px 22px", borderRadius: "11px", background: "linear-gradient(135deg, #6C63FF, #5A52D5)", color: "white", fontSize: "14px", fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 20px rgba(108,99,255,0.3)" }}>
                <ArrowLeft size={15} /> লগইনে ফিরে যান
              </Link>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: "22px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "linear-gradient(135deg, #6C63FF 0%, #d946ef 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 10px 24px rgba(108,99,255,0.35)" }}>
                  <KeyRound size={28} color="#fff" />
                </div>
                <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", marginBottom: "5px", letterSpacing: "-0.02em" }}>
                  পাসওয়ার্ড ভুলে গেছেন?
                </h1>
                <p style={{ fontSize: "13.5px", color: "var(--muted)", lineHeight: 1.6 }}>
                  আপনার ইমেইল দিন, আমরা রিসেট লিংক পাঠিয়ে দেব।
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", fontSize: "13px", color: "#ef4444", marginBottom: "12px" }}>
                    {error}
                  </div>
                )}

                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>ইমেইল</label>
                  <div className="search-box" style={inputWrap}>
                    <Mail size={15} color="var(--muted)" />
                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", fontSize: "14px", opacity: loading ? 0.7 : 1 }}>
                  {loading ? "পাঠানো হচ্ছে..." : <><Send size={15} /> রিসেট লিংক পাঠান</>}
                </button>
              </form>

              <p style={{ textAlign: "center", fontSize: "13.5px", color: "var(--muted)", marginTop: "18px" }}>
                মনে পড়েছে?{" "}
                <Link href="/login" style={{ fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}>
                  লগইন করুন
                </Link>
              </p>
            </>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "18px", fontSize: "12px", color: "var(--muted)", justifyContent: "center", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><ShieldCheck size={13} color="#10b981" /> এসক্রো সুরক্ষিত</span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Zap size={13} color="#f59e0b" /> দ্রুত পেমেন্ট</span>
        </div>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" };
const inputWrap: React.CSSProperties = { display: "flex", alignItems: "center", gap: "9px", padding: "10px 13px", border: "1.5px solid var(--border-strong)" };
const inputStyle: React.CSSProperties = { flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "13.5px", color: "var(--text)" };
