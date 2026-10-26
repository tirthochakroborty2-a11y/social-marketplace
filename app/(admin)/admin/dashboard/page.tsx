"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";
import {
  LayoutDashboard, ListChecks, ShoppingBag, AlertTriangle, Users,
  Wallet, FileText, Settings, LogOut, Menu, X, Crown,
  Moon, Sun, Sparkles, Check, Loader2, Download
} from "lucide-react";

const sidebarLinks = [
  { key: "overview", label: "ওভারভিউ", icon: LayoutDashboard },
  { key: "listings", label: "লিস্টিং", icon: ListChecks },
  { key: "wallet", label: "ওয়ালেট পেমেন্ট", icon: Wallet },
  { key: "withdraws", label: "উইথড্র", icon: Download },
  { key: "orders", label: "অর্ডার", icon: ShoppingBag },
  { key: "disputes", label: "ডিসপিউট", icon: AlertTriangle },
  { key: "users", label: "ইউজার", icon: Users },
  { key: "audit", label: "অডিট লগ", icon: FileText },
  { key: "settings", label: "সেটিংস", icon: Settings },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [pendingTx, setPendingTx] = useState<any[]>([]);
  const [pendingWithdraws, setPendingWithdraws] = useState<any[]>([]);
  const [counts, setCounts] = useState({ users: 0, listings: 0, orders: 0, pendingListings: 0 });
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (authorized) fetchData();
  }, [tab, authorized]);

  // Realtime
  useEffect(() => {
    if (!authorized) return;
    const c1 = supabase.channel("admin-listings").on("postgres_changes", { event: "*", schema: "public", table: "listings" }, () => fetchData()).subscribe();
    const c2 = supabase.channel("admin-wallet").on("postgres_changes", { event: "*", schema: "public", table: "wallet_transactions" }, () => {
      if (tab === "wallet") fetchWalletTx();
      if (tab === "withdraws") fetchWithdraws();
    }).subscribe();
    const c3 = supabase.channel("admin-orders").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchData()).subscribe();
    return () => {
      supabase.removeChannel(c1);
      supabase.removeChannel(c2);
      supabase.removeChannel(c3);
    };
  }, [authorized, tab]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/admin/login"; return; }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (!profile || !["admin", "superadmin"].includes(profile.role)) {
        await supabase.auth.signOut();
        window.location.href = "/admin/login?error=not_admin";
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

  const fetchData = async () => {
    if (tab === "wallet") fetchWalletTx();
    if (tab === "withdraws") fetchWithdraws();

    if (tab === "listings" || tab === "overview") {
      setLoadingListings(true);
      const { data } = await supabase.from("listings").select("id, title, platform, price, followers, status, seller_id, created_at").order("created_at", { ascending: false });
      setListings(data || []);
      setLoadingListings(false);
    }

    const [u, l, o, p] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("listings").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    setCounts({ users: u.count || 0, listings: l.count || 0, orders: o.count || 0, pendingListings: p.count || 0 });
  };

  const fetchWalletTx = async () => {
    const { data } = await supabase.from("wallet_transactions").select("*").eq("status", "pending").eq("type", "credit").order("created_at", { ascending: false });
    setPendingTx(data || []);
  };

  const fetchWithdraws = async () => {
    const { data } = await supabase.from("wallet_transactions").select("*").eq("status", "pending").eq("type", "debit").order("created_at", { ascending: false });
    setPendingWithdraws(data || []);
  };

  const approveTx = async (id: string, userId: string, amount: number) => {
    const { data: p } = await supabase.from("profiles").select("coin_balance").eq("id", userId).single();
    await supabase.from("profiles").update({ coin_balance: Number(p?.coin_balance || 0) + Number(amount) }).eq("id", userId);
    await supabase.from("wallet_transactions").update({ status: "completed" }).eq("id", id);
    showToast("success", "পেমেন্ট অ্যাপ্রুভ হয়েছে", "Coin যোগ করা হয়েছে ✅");
    fetchWalletTx();
  };

  const rejectTx = async (id: string) => {
    await supabase.from("wallet_transactions").update({ status: "failed" }).eq("id", id);
    showToast("warning", "পেমেন্ট রিজেক্ট হয়েছে");
    fetchWalletTx();
  };

  const approveWithdraw = async (id: string) => {
    await supabase.from("wallet_transactions").update({ status: "completed" }).eq("id", id);
    showToast("success", "উইথড্র সম্পন্ন", "টাকা পাঠানো হয়েছে ✅");
    fetchWithdraws();
  };

  const rejectWithdraw = async (id: string, userId: string, amount: number) => {
    const { data: p } = await supabase.from("profiles").select("coin_balance").eq("id", userId).single();
    await supabase.from("profiles").update({ coin_balance: Number(p?.coin_balance || 0) + Number(amount) }).eq("id", userId);
    await supabase.from("wallet_transactions").update({ status: "failed" }).eq("id", id);
    showToast("warning", "উইথড্র রিজেক্ট হয়েছে", "ব্যালেন্স ফেরত দেওয়া হয়েছে");
    fetchWithdraws();
  };

  const approveListing = async (id: string) => {
    await supabase.from("listings").update({ status: "active" }).eq("id", id);
    showToast("success", "লিস্টিং অ্যাপ্রুভ হয়েছে", "এখন সাইটে দেখা যাবে ✅");
    fetchData();
  };

  const rejectListing = async (id: string) => {
    await supabase.from("listings").update({ status: "rejected" }).eq("id", id);
    showToast("warning", "লিস্টিং রিজেক্ট হয়েছে");
    fetchData();
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) { document.documentElement.setAttribute("data-theme", "dark"); localStorage.setItem("theme", "dark"); }
    else { document.documentElement.removeAttribute("data-theme"); localStorage.setItem("theme", "light"); }
  };

  const bgColor = darkMode ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)";
  const textColor = darkMode ? "#e5e7eb" : "#2D2D3F";
  const panelBg = darkMode ? "#1e293b" : "white";
  const borderColor = darkMode ? "#334155" : "#E5E7EB";

  if (checking) return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 size={36} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
      <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </main>
  );

  if (!authorized) return null;

  const pendingListings = listings.filter((l) => l.status === "pending");

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, padding: "12px 0", background: bgColor, backdropFilter: "blur(20px)", boxShadow: "0 2px 30px rgba(0,0,0,0.06)", borderBottom: `1px solid ${borderColor}` }}>
        <div style={{ width: "100%", paddingLeft: "16px", paddingRight: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={19} color="#fff" />
            </div>
            <span style={{ fontSize: "19px", fontWeight: 800, color: textColor }}>Social<span style={{ color: "#6C63FF" }}>Market</span></span>
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: "rgba(239,68,68,0.1)", color: "#ef4444", display: "flex", alignItems: "center", gap: "4px" }}>
              <Crown size={11} /> Admin
            </span>
          </Link>

          <nav style={{ display: "flex", gap: "2px" }} className="admin-desktop-nav">
            {sidebarLinks.slice(0, 4).map((link) => {
              const Icon = link.icon;
              const active = tab === link.key;
              return (
                <button key={link.key} onClick={() => setTab(link.key)} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: active ? 700 : 500, color: active ? "#6C63FF" : textColor, padding: "8px 12px", borderRadius: "9px", background: active ? "rgba(108,99,255,0.1)" : "transparent", border: "none", cursor: "pointer" }}>
                  <Icon size={14} /> {link.label}
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
            <button onClick={() => setMenuOpen(!menuOpen)} className="admin-hamburger" style={{ display: "none", background: "transparent", border: "none", padding: "6px", cursor: "pointer" }}>
              {menuOpen ? <X size={22} color="#6C63FF" /> : <Menu size={22} color="#6C63FF" />}
            </button>
          </div>
        </div>
      </header>

      <div style={{ position: "fixed", top: 0, right: menuOpen ? 0 : "-320px", width: "300px", height: "100vh", background: panelBg, padding: "80px 24px 24px", zIndex: 1001, transition: "right 0.4s", overflowY: "auto", boxShadow: "-4px 0 30px rgba(0,0,0,0.15)" }}>
        {sidebarLinks.map((l) => {
          const Icon = l.icon;
          const active = tab === l.key;
          return (
            <button key={l.key} onClick={() => { setTab(l.key); setMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "13px 0", width: "100%", color: active ? "#6C63FF" : textColor, fontWeight: 600, fontSize: "14.5px", background: "transparent", border: "none", borderBottom: `1px solid ${borderColor}`, textAlign: "left", cursor: "pointer" }}>
              <Icon size={17} color={active ? "#6C63FF" : textColor} /> {l.label}
            </button>
          );
        })}
        <button onClick={handleLogout} style={{ marginTop: "16px", padding: "13px", borderRadius: "11px", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "14px", fontWeight: 700, border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", width: "100%" }}>
          <LogOut size={16} /> লগআউট
        </button>
      </div>
      <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 1000, opacity: menuOpen ? 1 : 0, visibility: menuOpen ? "visible" : "hidden", transition: "all 0.3s" }} />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "90px 20px 40px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", marginBottom: "4px" }}>{sidebarLinks.find((l) => l.key === tab)?.label}</h1>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>Admin Panel</p>
        </div>

        {tab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "20px" }}>
              {[
                { label: "মোট ইউজার", value: counts.users, color: "#6C63FF", icon: Users },
                { label: "মোট লিস্টিং", value: counts.listings, color: "#10b981", icon: ListChecks },
                { label: "মোট অর্ডার", value: counts.orders, color: "#f59e0b", icon: ShoppingBag },
                { label: "অ্যাপ্রুভাল বাকি", value: counts.pendingListings, color: "#ef4444", icon: AlertTriangle },
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
                <h2 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text)" }}>অ্যাপ্রুভাল প্রয়োজন</h2>
                <button onClick={() => setTab("listings")} style={{ fontSize: "12px", color: "var(--primary)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}>সব দেখুন →</button>
              </div>
              {loadingListings ? <Loader2 size={20} color="var(--muted)" /> : pendingListings.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "20px" }}>কোনো pending নেই ✅</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {pendingListings.slice(0, 3).map((l) => (
                    <div key={l.id} style={{ display: "flex", gap: "10px", padding: "10px 12px", background: "var(--bg)", borderRadius: "10px", border: "1px solid var(--border)", flexWrap: "wrap", alignItems: "center" }}>
                      <div style={{ flex: 1, minWidth: "150px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>{l.title}</p>
                        <p style={{ fontSize: "11px", color: "var(--muted)" }}>{l.platform} · {l.followers} ফলোয়ার</p>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--primary)" }}>৳{Number(l.price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "listings" && (
          <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px", padding: "18px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text)", marginBottom: "16px" }}>লিস্টিং ({listings.length})</h2>
            {loadingListings ? <div style={{ textAlign: "center", padding: "40px" }}><Loader2 size={28} color="var(--muted)" /></div> : listings.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "40px" }}>কোনো listing নেই</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {listings.map((l) => (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "var(--bg)", borderRadius: "11px", border: "1px solid var(--border)", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text)", marginBottom: "3px" }}>{l.title}</p>
                      <p style={{ fontSize: "11.5px", color: "var(--muted)" }}>{l.platform} · {l.followers} · ৳{Number(l.price).toLocaleString()}</p>
                    </div>
                    <span style={{ fontSize: "10.5px", fontWeight: 700, padding: "3px 8px", borderRadius: "5px", color: l.status === "active" ? "#10b981" : l.status === "pending" ? "#f59e0b" : l.status === "sold" ? "#6C63FF" : "#ef4444", background: l.status === "active" ? "rgba(16,185,129,0.1)" : l.status === "pending" ? "rgba(245,158,11,0.1)" : l.status === "sold" ? "rgba(108,99,255,0.1)" : "rgba(239,68,68,0.1)" }}>
                      {l.status === "active" ? "সক্রিয়" : l.status === "pending" ? "পেন্ডিং" : l.status === "sold" ? "বিক্রি" : "রিজেক্টেড"}
                    </span>
                    {l.status === "pending" && (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => approveListing(l.id)} style={{ padding: "6px 11px", borderRadius: "7px", background: "rgba(16,185,129,0.1)", color: "#10b981", fontSize: "11.5px", fontWeight: 700, border: "1px solid rgba(16,185,129,0.2)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Check size={12} /> অ্যাপ্রুভ
                        </button>
                        <button onClick={() => rejectListing(l.id)} style={{ padding: "6px 11px", borderRadius: "7px", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "11.5px", fontWeight: 700, border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                          <X size={12} /> রিজেক্ট
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "wallet" && (
          <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px", padding: "18px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text)", marginBottom: "14px" }}>পেন্ডিং পেমেন্ট ({pendingTx.length})</h2>
            {pendingTx.length === 0 ? <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "40px" }}>কোনো পেন্ডিং নেই ✅</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {pendingTx.map((tx) => (
                  <div key={tx.id} style={{ padding: "14px", background: "var(--bg)", borderRadius: "11px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{tx.reason}</span>
                      <span style={{ fontSize: "16px", fontWeight: 800, color: "#6C63FF" }}>৳{Number(tx.amount).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: "11.5px", color: "var(--muted)", marginBottom: "10px" }}>{new Date(tx.created_at).toLocaleString("bn-BD")}</p>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => approveTx(tx.id, tx.user_id, tx.amount)} style={{ padding: "7px 14px", borderRadius: "7px", background: "rgba(16,185,129,0.1)", color: "#10b981", fontSize: "12px", fontWeight: 700, border: "1px solid rgba(16,185,129,0.2)", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                        <Check size={12} /> অ্যাপ্রুভ
                      </button>
                      <button onClick={() => rejectTx(tx.id)} style={{ padding: "7px 14px", borderRadius: "7px", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "12px", fontWeight: 700, border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                        <X size={12} /> রিজেক্ট
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "withdraws" && (
          <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px", padding: "18px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text)", marginBottom: "14px" }}>পেন্ডিং উইথড্র ({pendingWithdraws.length})</h2>
            {pendingWithdraws.length === 0 ? <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "40px" }}>কোনো পেন্ডিং নেই ✅</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {pendingWithdraws.map((tx) => (
                  <div key={tx.id} style={{ padding: "14px", background: "var(--bg)", borderRadius: "11px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{tx.reason}</span>
                      <span style={{ fontSize: "16px", fontWeight: 800, color: "#ef4444" }}>৳{Number(tx.amount).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: "11.5px", color: "var(--muted)", marginBottom: "10px" }}>{new Date(tx.created_at).toLocaleString("bn-BD")}</p>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => approveWithdraw(tx.id)} style={{ padding: "7px 14px", borderRadius: "7px", background: "rgba(16,185,129,0.1)", color: "#10b981", fontSize: "12px", fontWeight: 700, border: "1px solid rgba(16,185,129,0.2)", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                        <Check size={12} /> পাঠানো হয়েছে
                      </button>
                      <button onClick={() => rejectWithdraw(tx.id, tx.user_id, tx.amount)} style={{ padding: "7px 14px", borderRadius: "7px", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "12px", fontWeight: 700, border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                        <X size={12} /> রিজেক্ট
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab !== "overview" && tab !== "listings" && tab !== "wallet" && tab !== "withdraws" && (
          <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px", padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "var(--muted)" }}>{sidebarLinks.find((l) => l.key === tab)?.label} সেকশন শীঘ্রই আসছে</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 992px) {
          .admin-desktop-nav { display: none !important; }
          .admin-hamburger { display: flex !important; }
        }
      `}</style>
    </main>
  );
}
