"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const redirectUrl = params.get("redirect") || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("ইমেইল ও পাসওয়ার্ড দিন");
      return;
    }
    setLoading(true);
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (authErr) {
      setError(authErr.message);
      showToast("error", "লগইন ব্যর্থ", authErr.message);
      return;
    }
    showToast("success", "লগইন সফল!", "স্বাগতম, আপনি সফলভাবে লগইন করেছেন ✅");
    setTimeout(() => {
      router.push(redirectUrl);
      router.refresh();
    }, 500);
    router.refresh();
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
          <div style={{ textAlign: "center", marginBottom: "22px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", marginBottom: "5px", letterSpacing: "-0.02em" }}>স্বাগতম ফিরে!</h1>
            <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", fontSize: "13px", color: "#ef4444", marginBottom: "12px" }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>ইমেইল</label>
              <div className="search-box" style={inputWrap}>
                <Mail size={15} color="var(--muted)" />
                <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: "8px" }}>
              <label style={labelStyle}>পাসওয়ার্ড</label>
              <div className="search-box" style={inputWrap}>
                <Lock size={15} color="var(--muted)" />
                <input type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={eyeBtn}>
                  {showPass ? <EyeOff size={15} color="var(--muted)" /> : <Eye size={15} color="var(--muted)" />}
                </button>
              </div>
            </div>

            <div style={{ textAlign: "right", marginBottom: "16px" }}>
              <Link href="/forgot-password" style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--primary)", textDecoration: "none" }}>পাসওয়ার্ড ভুলে গেছেন?</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", fontSize: "14px", opacity: loading ? 0.7 : 1 }}>
              {loading ? "লগইন হচ্ছে..." : <><LogIn size={15} /> লগইন</>}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13.5px", color: "var(--muted)", marginTop: "18px" }}>
            অ্যাকাউন্ট নেই?{" "}
            <Link href={`/register?redirect=${encodeURIComponent(redirectUrl)}`} style={{ fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}>রেজিস্টার করুন</Link>
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "18px", fontSize: "12px", color: "var(--muted)", justifyContent: "center", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><ShieldCheck size={13} color="#10b981" /> এসক্রো সুরক্ষিত</span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Zap size={13} color="#f59e0b" /> দ্রুত পেমেন্ট</span>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>লোড হচ্ছে...</div>}>
      <LoginContent />
    </Suspense>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" };
const inputWrap: React.CSSProperties = { display: "flex", alignItems: "center", gap: "9px", padding: "10px 13px", border: "1.5px solid var(--border-strong)" };
const inputStyle: React.CSSProperties = { flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "13.5px", color: "var(--text)" };
const eyeBtn: React.CSSProperties = { background: "transparent", border: "none", cursor: "pointer", display: "flex", padding: 0 };
