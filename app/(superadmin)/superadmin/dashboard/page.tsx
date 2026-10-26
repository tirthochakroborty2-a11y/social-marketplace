"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Crown, Users, FileText, Settings, LogOut, Menu, X, Moon, Sun,
  Sparkles, CheckCircle2, Activity, ThumbsUp, ThumbsDown, MessageSquare,
  ShieldCheck, Loader2
} from "lucide-react";

const navLinks = [
  { key: "overview", label: "ওভারভিউ", icon: Crown },
  { key: "team", label: "টিম গ্রুপ", icon: Users },
  { key: "approvals", label: "অ্যাপ্রুভাল", icon: ThumbsUp },
  { key: "activity", label: "অ্যাক্টিভিটি", icon: Activity },
  { key: "audit", label: "অডিট লগ", icon: FileText },
  { key: "settings", label: "সেটিংস", icon: Settings },
];

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (authorized) fetchAdmins();
  }, [authorized, tab]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/admin/login"; return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "superadmin") {
        await supabase.auth.signOut();
        window.location.href = "/admin/login?error=superadmin_only";
        return;
      }

      setAuthorized(true);
      setChecking(false);
    } catch {
      window.location.href = "/admin/login";
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (e) {
      console.log("SignOut error:", e);
    }
    try {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } catch {}
    window.location.replace("/admin/login");
  };

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, name, email, role, created_at")
      .in("role", ["admin", "superadmin"])
      .order("created_at", { ascending: false });
    setAdmins(data || []);
    setLoadingAdmins(false);
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  };

  const bgColor = darkMode ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)";
  const textColor = darkMode ? "#e5e7eb" : "#2D2D3F";
  const panelBg = darkMode ? "#1e293b" : "white";
  const borderColor = darkMode ? "#334155" : "#E5E7EB";

  if (checking) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={36} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
        <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  if (!authorized) return null;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, padding: "12px 0", background: bgColor, backdropFilter: "blur(20px)", boxShadow: "0 2px 30px rgba(0,0,0,0.06)", borderBottom: `1px solid ${borderColor}` }}>
        <div style={{ width: "100%", paddingLeft: "16px", paddingRight: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg, #ef4444, #f59e0b)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Crown size={19} color="#fff" />
            </div>
            <span style={{ fontSize: "19px", fontWeight: 800, color: textColor }}>
              Social<span style={{ color: "#ef4444" }}>Market</span>
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: "rgba(239,68,68,0.1)", color: "#ef4444", display: "flex", alignItems: "center", gap: "4px" }}>
              <Crown size={11} /> Super
            </span>
          </Link>

          <nav style={{ display: "flex", gap: "2px" }} className="desktop-nav">
            {navLinks.map((l) => {
              const Icon = l.icon;
              const active = tab === l.key;
              return (
                <button key={l.key} onClick={() => setTab(l.key)} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: active ? 700 : 500, color: active ? "#ef4444" : textColor, padding: "8px 11px", borderRadius: "9px", background: active ? "rgba(239,68,68,0.1)" : "transparent", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                  <Icon size={14} /> {l.label}
                </button>
              );
            })}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={toggleDarkMode} style={{ width: "34px", height: "34px", borderRadius: "50%", background: darkMode ? "#334155" : "#F8F9FE", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {darkMode ? <Sun size={15} color="#FFC857" /> : <Moon size={15} color="#6C63FF" />}
            </button>
            <button onClick={handleLogout} title="Logout" style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, #ef4444, #f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
              <LogOut size={15} color="white" />
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger" style={{ display: "none", background: "transparent", border: "none", padding: "6px", cursor: "pointer" }}>
              {menuOpen ? <X size={22} color="#ef4444" /> : <Menu size={22} color="#ef4444" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div style={{ position: "fixed", top: 0, right: menuOpen ? 0 : "-320px", width: "300px", height: "100vh", background: panelBg, boxShadow: "-4px 0 30px rgba(0,0,0,0.15)", padding: "80px 24px 24px", zIndex: 1001, transition: "right 0.4s", overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {navLinks.map((l) => {
            const Icon = l.icon;
            const active = tab === l.key;
            return (
              <button key={l.key} onClick={() => { setTab(l.key); setMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "13px 0", color: active ? "#ef4444" : textColor, fontWeight: 600, fontSize: "14px", background: "transparent", border: "none", borderBottom: `1px solid ${borderColor}`, textAlign: "left", cursor: "pointer" }}>
                <Icon size={17} color={active ? "#ef4444" : textColor} /> {l.label}
              </button>
            );
          })}
          <button onClick={handleLogout} style={{ marginTop: "16px", padding: "13px", borderRadius: "11px", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "14px", fontWeight: 700, border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", width: "100%" }}>
            <LogOut size={16} /> লগআউট
          </button>
        </div>
      </div>
      <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 1000, opacity: menuOpen ? 1 : 0, visibility: menuOpen ? "visible" : "hidden", transition: "all 0.3s" }} />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "90px 20px 40px" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Crown size={20} color="#ef4444" />
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)" }}>
              {navLinks.find((l) => l.key === tab)?.label}
            </h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>আপনার সম্পূর্ণ নিয়ন্ত্রণে</p>
        </div>

        {tab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "20px" }}>
              {[
                { label: "মোট Admin", value: admins.length, color: "#ef4444", icon: Users },
                { label: "Super Admin", value: admins.filter((a) => a.role === "superadmin").length, color: "#f59e0b", icon: Crown },
                { label: "Regular Admin", value: admins.filter((a) => a.role === "admin").length, color: "#6C63FF", icon: ShieldCheck },
                { label: "সিস্টেম", value: "সক্রিয়", color: "#10b981", icon: CheckCircle2 },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "14px", padding: "16px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                      <Icon size={16} color={s.color} />
                    </div>
                    <p style={{ fontSize: "11.5px", color: "var(--muted)", marginBottom: "4px" }}>{s.label}</p>
                    <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)" }}>{s.value}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                <h2 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text)" }}>Admin তালিকা</h2>
                <button onClick={() => setTab("team")} style={{ fontSize: "12px", color: "#ef4444", background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}>সব দেখুন →</button>
              </div>
              {loadingAdmins ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Loader2 size={20} color="var(--muted)" />
                </div>
              ) : admins.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "20px" }}>কোনো admin নেই</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {admins.slice(0, 5).map((a) => (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "var(--bg)", borderRadius: "10px", border: "1px solid var(--border)", flexWrap: "wrap" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: a.role === "superadmin" ? "linear-gradient(135deg, #ef4444, #f59e0b)" : "linear-gradient(135deg, #6C63FF, #d946ef)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "13px" }}>
                        {a.role === "superadmin" ? <Crown size={14} /> : (a.name || a.email || "A").charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: "150px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>{a.name || a.email?.split("@")[0]}</p>
                        <p style={{ fontSize: "11px", color: "var(--muted)" }}>{a.email}</p>
                      </div>
                      <span style={{ fontSize: "10.5px", fontWeight: 700, padding: "3px 8px", borderRadius: "5px", color: a.role === "superadmin" ? "#ef4444" : "#6C63FF", background: a.role === "superadmin" ? "rgba(239,68,68,0.1)" : "rgba(108,99,255,0.1)" }}>
                        {a.role === "superadmin" ? "👑 Super" : "Admin"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "team" && (
          <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px", padding: "18px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text)", marginBottom: "14px" }}>Admin তালিকা ({admins.length})</h2>
            {loadingAdmins ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Loader2 size={28} color="var(--muted)" />
              </div>
            ) : admins.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "40px" }}>কোনো admin নেই</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {admins.map((a) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "var(--bg)", borderRadius: "11px", border: "1px solid var(--border)", flexWrap: "wrap" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: a.role === "superadmin" ? "linear-gradient(135deg, #ef4444, #f59e0b)" : "linear-gradient(135deg, #6C63FF, #d946ef)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "14px", flexShrink: 0 }}>
                      {a.role === "superadmin" ? <Crown size={17} /> : (a.name || a.email || "A").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: "150px" }}>
                      <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>{a.name || a.email?.split("@")[0]}</p>
                      <p style={{ fontSize: "11.5px", color: "var(--muted)" }}>{a.email}</p>
                    </div>
                    <span style={{ fontSize: "10.5px", fontWeight: 700, padding: "3px 8px", borderRadius: "5px", color: a.role === "superadmin" ? "#ef4444" : "#6C63FF", background: a.role === "superadmin" ? "rgba(239,68,68,0.1)" : "rgba(108,99,255,0.1)" }}>
                      {a.role === "superadmin" ? "👑 Super" : "Admin"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab !== "overview" && tab !== "team" && (
          <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px", padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "var(--muted)" }}>
              {navLinks.find((l) => l.key === tab)?.label} সেকশন শীঘ্রই আসছে
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1100px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </main>
  );
}
