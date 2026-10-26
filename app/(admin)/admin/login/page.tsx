"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ShieldCheck, Eye, EyeOff, LogIn, Crown, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";

const SUPER_ADMIN_EMAIL = "tirthochakroborty2@gmail.com";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const [role, setRole] = useState<"admin" | "superadmin">("admin");
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const err = params.get("error");
    if (err === "not_admin") setError("এই অ্যাকাউন্টটি অ্যাডমিন নয়");
    if (err === "unauthorized") setError("আপনি অনুমোদিত নন");
    if (err === "superadmin_only") setError("শুধু Super Admin এই পেজে ঢুকতে পারে");
  }, [params]);

  useEffect(() => {
    const checkExisting = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
          if (profile && ["admin", "superadmin"].includes(profile.role)) {
            router.push(profile.role === "superadmin" ? "/superadmin/dashboard" : "/admin/dashboard");
            return;
          }
        }
      } catch {}
      setChecking(false);
    };
    checkExisting();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("ইমেইল ও পাসওয়ার্ড দিন");
      return;
    }

    if (role === "superadmin" && form.email.trim().toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      setError("এই ইমেইল Super Admin নয় — শুধু তirthochakroborty2@gmail.com ব্যবহার করুন");
      return;
    }

    setLoading(true);

    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });

    if (authErr) {
      setError(authErr.message);
      showToast("error", "লগইন ব্যর্থ", authErr.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("লগইন ব্যর্থ");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    if (!profile || !["admin", "superadmin"].includes(profile.role)) {
      await supabase.auth.signOut();
      setError("এই অ্যাকাউন্টটি অ্যাডমিন নয়");
      setLoading(false);
      return;
    }

    if (role === "superadmin" && profile.role !== "superadmin") {
      await supabase.auth.signOut();
      setError("আপনি Super Admin নন");
      setLoading(false);
      return;
    }

    setLoading(false);
    showToast("success", "লগইন সফল!", role === "superadmin" ? "Super Admin হিসেবে লগইন" : "Admin হিসেবে লগইন");
    setTimeout(() => {
      if (role === "superadmin") {
        router.push("/superadmin/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
      router.refresh();
    }, 500);
  };

  if (checking) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={36} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
        <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  const isSuper = role === "superadmin";
  const accentGradient = isSuper ? "linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)" : "linear-gradient(135deg, #6C63FF 0%, #d946ef 100%)";

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", padding: "30px 20px 40px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "5%", left: "5%", width: "500px", height: "500px", background: isSuper ? "radial-gradient(circle, rgba(239,68,68,0.18) 0%, transparent 70%)" : "radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "5%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "440px", margin: "0 auto", position: "relative", zIndex: 1, width: "100%" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", textDecoration: "none", marginBottom: "24px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: accentGradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isSuper ? "0 10px 24px rgba(239,68,68,0.35)" : "0 10px 24px rgba(139,92,246,0.35)" }}>
            {isSuper ? <Crown size={24} color="#fff" /> : <ShieldCheck size={24} color="#fff" />}
          </div>
          <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)" }}>
            Social<span style={{ color: isSuper ? "#ef4444" : "#6C63FF" }}>Admin</span>
          </span>
        </Link>

        <div style={{ display: "flex", gap: "6px", background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "14px", padding: "5px", marginBottom: "16px" }}>
          <button onClick={() => { setRole("admin"); setError(""); }} style={{ flex: 1, padding: "11px", borderRadius: "10px", background: role === "admin" ? "linear-gradient(135deg, #6C63FF, #5A52D5)" : "transparent", color: role === "admin" ? "white" : "var(--muted)", fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <ShieldCheck size={15} /> Admin
          </button>
          <button onClick={() => { setRole("superadmin"); setError(""); }} style={{ flex: 1, padding: "11px", borderRadius: "10px", background: role === "superadmin" ? "linear-gradient(135deg, #ef4444, #dc2626)" : "transparent", color: role === "superadmin" ? "white" : "var(--muted)", fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <Crown size={15} /> Super Admin
          </button>
        </div>

        <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "20px", padding: "28px 26px", boxShadow: isSuper ? "0 20px 60px -20px rgba(239,68,68,0.3)" : "0 20px 60px -20px rgba(108,99,255,0.25)" }}>
          <div style={{ textAlign: "center", marginBottom: "22px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: accentGradient, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              {isSuper ? <Crown size={26} color="#fff" /> : <ShieldCheck size={26} color="#fff" />}
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)", marginBottom: "4px" }}>{isSuper ? "Super Admin Login" : "Admin Login"}</h1>
            <p style={{ fontSize: "12.5px", color: "var(--muted)" }}>{isSuper ? "শুধু প্রধান অ্যাডমিনের জন্য" : "শুধু অনুমোদিত অ্যাডমিন"}</p>
          </div>

          {isSuper && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "9px", padding: "11px 13px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", marginBottom: "16px" }}>
              <Crown size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "11.5px", color: "var(--text)", lineHeight: 1.6 }}>
                শুধু <strong style={{ color: "#ef4444" }}>{SUPER_ADMIN_EMAIL}</strong> দিয়ে login করা যাবে।
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "11px 13px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", fontSize: "12.5px", color: "#ef4444", marginBottom: "14px", lineHeight: 1.5 }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>ইমেইল</label>
              <div className="search-box" style={inputWrap}>
                <Mail size={15} color="var(--muted)" />
                <input type="email" placeholder={isSuper ? SUPER_ADMIN_EMAIL : "admin@socialmarket.com"} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>পাসওয়ার্ড</label>
              <div className="search-box" style={inputWrap}>
                <Lock size={15} color="var(--muted)" />
                <input type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={eyeBtn}>
                  {showPass ? <EyeOff size={15} color="var(--muted)" /> : <Eye size={15} color="var(--muted)" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", borderRadius: "11px", background: isSuper ? "linear-gradient(135deg, #ef4444, #dc2626)" : "linear-gradient(135deg, #6C63FF, #5A52D5)", color: "white", fontSize: "14px", fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", opacity: loading ? 0.7 : 1 }}>
              {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> লগইন হচ্ছে...</> : <><LogIn size={15} /> লগইন করুন</>}
            </button>
          </form>

          <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <p style={{ fontSize: "11.5px", color: "var(--muted)", lineHeight: 1.6 }}>⚠️ Admin register নেই। শুধু Super Admin নতুন Admin বানাতে পারে।</p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Link href="/login" style={{ fontSize: "12.5px", color: "var(--muted)", textDecoration: "none" }}>← সাধারণ লগইনে ফিরে যান</Link>
        </div>
      </div>

      <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

export default function AdminLoginPage() {
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
