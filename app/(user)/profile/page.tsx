"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { uploadAvatar } from "@/lib/supabase/storage";
import {
  User, Mail, Camera, Save, Lock, Eye, EyeOff, LogOut,
  CheckCircle2, Shield, Trash2, Loader2, AlertCircle
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"info" | "password" | "danger">("info");

  const [form, setForm] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setUser(user);

    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(p);

    if (p) {
      setForm({ name: p.name || "", email: p.email || user.email || "" });
    }

    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("ছবি ২ MB-এর কম হতে হবে");
      return;
    }

    setUploading(true);
    setError("");

    const url = await uploadAvatar(file, user.id);
    if (!url) {
      setError("ছবি আপলোড ব্যর্থ");
      setUploading(false);
      return;
    }

    await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    setProfile({ ...profile, avatar_url: url });
    setUploading(false);
    setSuccess("✅ ছবি আপলোড হয়েছে");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    if (!form.name.trim()) {
      setError("নাম দিন");
      setSaving(false);
      return;
    }

    const { error: e1 } = await supabase.from("profiles").update({ name: form.name.trim() }).eq("id", user.id);

    if (e1) {
      setError(e1.message);
      setSaving(false);
      return;
    }

    setProfile({ ...profile, name: form.name.trim() });
    setSaving(false);
    setSuccess("✅ তথ্য সংরক্ষিত হয়েছে");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      setError("সব ঘর পূরণ করুন");
      return;
    }
    if (passwords.newPass.length < 8) {
      setError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষর");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setError("পাসওয়ার্ড মিলছে না");
      return;
    }

    setSaving(true);

    // আগে current password verify করি
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: passwords.current,
    });

    if (verifyErr) {
      setError("বর্তমান পাসওয়ার্ড ভুল");
      setSaving(false);
      return;
    }

    const { error: updateErr } = await supabase.auth.updateUser({ password: passwords.newPass });

    if (updateErr) {
      setError(updateErr.message);
      setSaving(false);
      return;
    }

    setPasswords({ current: "", newPass: "", confirm: "" });
    setSaving(false);
    setSuccess("✅ পাসওয়ার্ড বদলানো হয়েছে");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch {}
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/login");
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("সত্যিই অ্যাকাউন্ট মুছবেন? এটা ফিরিয়ে আনা যাবে না।");
    if (!confirm) return;

    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.signOut();
    window.location.replace("/");
  };

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={36} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
        <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  const initial = (profile?.name || user?.email || "U").charAt(0).toUpperCase();
  const joined = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "long" }) : "";

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />

      <div style={{ flex: 1, maxWidth: "900px", margin: "0 auto", padding: "90px 20px 40px", width: "100%" }}>

        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800, color: "var(--text)", marginBottom: "4px", letterSpacing: "-0.02em" }}>প্রোফাইল</h1>
          <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>আপনার ব্যক্তিগত তথ্য ও নিরাপত্তা</p>
        </div>

        {success && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "11px", marginBottom: "16px", color: "#10b981", fontSize: "13px", fontWeight: 600 }}>
            <CheckCircle2 size={15} /> {success}
          </div>
        )}

        {/* Header Card */}
        <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "20px", padding: "24px", marginBottom: "16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "180px", height: "180px", background: "radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", position: "relative" }}>
            <div style={{ position: "relative" }}>
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  style={{ width: "88px", height: "88px", borderRadius: "24px", objectFit: "cover", border: "3px solid #6C63FF" }}
                />
              ) : (
                <div style={{ width: "88px", height: "88px", borderRadius: "24px", background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "32px", fontWeight: 800, boxShadow: "0 12px 30px rgba(139,92,246,0.4)" }}>
                  {initial}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "32px", height: "32px", borderRadius: "10px", background: "var(--card)", border: "2px solid var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", cursor: uploading ? "wait" : "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}
              >
                {uploading ? <Loader2 size={13} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} /> : <Camera size={13} color="var(--primary)" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
            </div>

            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)" }}>{profile?.name || "ব্যবহারকারী"}</h2>
                {profile?.role === "admin" || profile?.role === "superadmin" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10.5px", fontWeight: 700, color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <Shield size={10} /> {profile.role === "superadmin" ? "Super Admin" : "Admin"}
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10.5px", fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <CheckCircle2 size={10} /> ভেরিফায়েড
                  </span>
                )}
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--muted)", marginBottom: "6px" }}>{user?.email}</p>
              {joined && <p style={{ fontSize: "12px", color: "var(--muted)" }}>যোগদান: {joined}</p>}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "12px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "11px", fontSize: "13px", color: "#ef4444", marginBottom: "16px" }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Tabs */}
        <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "20px", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: "1.5px solid var(--border)", overflowX: "auto" }}>
            {[
              { key: "info", label: "তথ্য", icon: User },
              { key: "password", label: "পাসওয়ার্ড", icon: Lock },
              { key: "danger", label: "ডেঞ্জার জোন", icon: Shield },
            ].map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => { setTab(t.key as any); setError(""); }} style={{ flex: 1, minWidth: "120px", padding: "16px 20px", background: "transparent", border: "none", borderBottom: active ? "2.5px solid var(--primary)" : "2.5px solid transparent", color: active ? "var(--primary)" : "var(--muted)", fontSize: "13.5px", fontWeight: active ? 700 : 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", whiteSpace: "nowrap" }}>
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </div>

          <div style={{ padding: "24px" }}>

            {tab === "info" && (
              <form onSubmit={handleSaveInfo}>
                <div style={{ marginBottom: "14px" }}>
                  <label style={labelStyle}>পুরো নাম</label>
                  <div className="search-box" style={inputWrap}>
                    <User size={15} color="var(--muted)" />
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="আপনার নাম" />
                  </div>
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label style={labelStyle}>ইমেইল</label>
                  <div className="search-box" style={{ ...inputWrap, background: "var(--bg)", opacity: 0.7 }}>
                    <Mail size={15} color="var(--muted)" />
                    <input type="email" value={form.email} disabled style={{ ...inputStyle, cursor: "not-allowed" }} />
                  </div>
                  <p style={{ fontSize: "11.5px", color: "var(--muted)", marginTop: "6px" }}>ইমেইল পরিবর্তন করা যায় না</p>
                </div>

                <button type="submit" disabled={saving} className="btn-primary" style={{ padding: "11px 24px", fontSize: "13.5px", display: "inline-flex", alignItems: "center", gap: "7px", opacity: saving ? 0.7 : 1 }}>
                  {saving ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> সংরক্ষণ হচ্ছে...</> : <><Save size={14} /> সংরক্ষণ করুন</>}
                </button>
              </form>
            )}

            {tab === "password" && (
              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: "14px" }}>
                  <label style={labelStyle}>বর্তমান পাসওয়ার্ড</label>
                  <div className="search-box" style={inputWrap}>
                    <Lock size={15} color="var(--muted)" />
                    <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} placeholder="••••••••" style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={labelStyle}>নতুন পাসওয়ার্ড</label>
                  <div className="search-box" style={inputWrap}>
                    <Lock size={15} color="var(--muted)" />
                    <input type={showPass ? "text" : "password"} value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} placeholder="কমপক্ষে ৮ অক্ষর" style={inputStyle} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={eyeBtn}>
                      {showPass ? <EyeOff size={15} color="var(--muted)" /> : <Eye size={15} color="var(--muted)" />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label style={labelStyle}>কনফার্ম নতুন পাসওয়ার্ড</label>
                  <div className="search-box" style={inputWrap}>
                    <Lock size={15} color="var(--muted)" />
                    <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="আবার পাসওয়ার্ড দিন" style={inputStyle} />
                  </div>
                </div>

                <button type="submit" disabled={saving} className="btn-primary" style={{ padding: "11px 24px", fontSize: "13.5px", display: "inline-flex", alignItems: "center", gap: "7px", opacity: saving ? 0.7 : 1 }}>
                  {saving ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> সংরক্ষণ হচ্ছে...</> : <><Lock size={14} /> পাসওয়ার্ড বদলান</>}
                </button>
              </form>
            )}

            {tab === "danger" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ padding: "16px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <LogOut size={16} color="#f59e0b" />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>লগ আউট</span>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "12px" }}>সব ডিভাইস থেকে লগআউট করুন</p>
                  <button onClick={handleLogout} style={{ padding: "9px 18px", borderRadius: "9px", border: "1px solid #f59e0b", background: "transparent", color: "#f59e0b", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    লগআউট করুন
                  </button>
                </div>

                <div style={{ padding: "16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <Trash2 size={16} color="#ef4444" />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>অ্যাকাউন্ট মুছুন</span>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "12px" }}>এই কাজটি ফিরিয়ে আনা যাবে না। আপনার সব ডেটা মুছে যাবে।</p>
                  <button onClick={handleDeleteAccount} style={{ padding: "9px 18px", borderRadius: "9px", border: "1px solid #ef4444", background: "transparent", color: "#ef4444", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    অ্যাকাউন্ট মুছুন
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" };
const inputWrap: React.CSSProperties = { display: "flex", alignItems: "center", gap: "9px", padding: "10px 13px", border: "1.5px solid var(--border-strong)" };
const inputStyle: React.CSSProperties = { flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "13.5px", color: "var(--text)" };
const eyeBtn: React.CSSProperties = { background: "transparent", border: "none", cursor: "pointer", display: "flex", padding: 0 };
