"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, UserPlus, Sparkles, ShieldCheck, Zap, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";

// ১. মূল ফাংশন (যেখানে useSearchParams আছে)
function RegisterContent() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const redirectUrl = params.get("redirect") || "/";

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("সব ঘর পূরণ করুন");
      return;
    }
    if (form.password.length < 8) {
      setError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name } },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      showToast("error", "রেজিস্ট্রেশন ব্যর্থ", error.message);
      return;
    }

    showToast("success", "রেজিস্ট্রেশন সফল!", "ইমেইল ভেরিফাই করুন — কোড পাঠানো হয়েছে ✅");
    setTimeout(() => {
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}&redirect=${encodeURIComponent(redirectUrl)}`);
    }, 500);
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

        <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "20px", padding: "28px 26px", boxShadow: "0 20px 60px -20px rgba(108,99,255,0.25)" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", marginBottom: "5px", letterSpacing: "-0.02em" }}>অ্যাকাউন্ট খুলুন</h1>
            <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>মাত্র কয়েক সেকেন্ডে শুরু করুন</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", fontSize: "13px", color: "#ef4444", marginBottom: "12px" }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: "10px" }}>
              <label style={labelStyle}>পুরো নাম</label>
              <div className="search-box" style={inputWrap}>
                <User size={15} color="var(--muted)" />
                <input type="text" placeholder="আপনার নাম" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label style={labelStyle}>ইমেইল</label>
              <div className="search-box" style={inputWrap}>
                <Mail size={15} color="var(--muted)" />
                <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label style={labelStyle}>পাসওয়ার্ড</label>
              <div className="search-box" style={inputWrap}>
                <Lock size={15} color="var(--muted)" />
                <input type={showPass ? "text" : "password"} placeholder="কমপক্ষে ৮ অক্ষর" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={eyeBtn}>
                  {showPass ? <EyeOff size={15} color="var(--muted)" /> : <Eye size={15} color="var(--muted)" />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>কনফার্ম পাসওয়ার্ড</label>
              <div className="search-box" style={inputWrap}>
                <Lock size={15} color="var(--muted)" />
                <input type={showConfirm ? "text" : "password"} placeholder="আবার পাসওয়ার্ড দিন" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} style={inputStyle} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={eyeBtn}>
                  {showConfirm ? <EyeOff size={15} color="var(--muted)" /> : <Eye size={15} color="var(--muted)" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", fontSize: "14px", opacity: loading ? 0.7 : 1 }}>
              {loading ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : <><UserPlus size={15} /> রেজিস্টার করুন</>}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13.5px", color: "var(--muted)", marginTop: "18px" }}>
            অ্যাকাউন্ট আছে?{" "}
            <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`} style={{ fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}>লগইন করুন</Link>
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

// ২. Suspense দিয়ে মুড়ে দেওয়া (এটাই বিল্ড এরর ঠিক করবে)
export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>লোড হচ্ছে...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" };
const inputWrap: React.CSSProperties = { display: "flex", alignItems: "center", gap: "9px", padding: "10px 13px", border: "1.5px solid var(--border-strong)" };
const inputStyle: React.CSSProperties = { flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "13.5px", color: "var(--text)" };
const eyeBtn: React.CSSProperties = { background: "transparent", border: "none", cursor: "pointer", display: "flex", padding: 0 };
