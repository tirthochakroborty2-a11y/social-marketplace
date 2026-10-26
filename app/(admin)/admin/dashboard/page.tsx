"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";
import {
  LayoutDashboard, ListChecks, ShoppingBag, AlertTriangle, Users,
  Wallet, FileText, Settings, LogOut, Menu, X, Crown,
  Moon, Sun, Sparkles, Check, Loader2, Download, Ban, Trash2, XCircle
} from "lucide-react";

const sidebarLinks = [
  { key: "overview", label: "ওভারভিউ", icon: LayoutDashboard },
  { key: "users", label: "ইউজার ম্যানেজমেন্ট", icon: Users },
  { key: "listings", label: "লিস্টিং", icon: ListChecks },
  { key: "orders", label: "অর্ডার", icon: ShoppingBag },
  { key: "disputes", label: "ডিসপিউট", icon: AlertTriangle },
  { key: "wallet", label: "ওয়ালেট পেমেন্ট", icon: Wallet },
  { key: "withdraws", label: "উইথড্র রিকোয়েস্ট", icon: Download },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Data States
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [pendingTx, setPendingTx] = useState<any[]>([]);
  const [pendingWithdraws, setPendingWithdraws] = useState<any[]>([]);
  const [counts, setCounts] = useState({ users: 0, listings: 0, orders: 0, pendingListings: 0 });
  const [loading, setLoading] = useState(true);

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
    await supabase.auth.signOut({ scope: "global" });
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/admin/login");
  };

  const fetchData = async () => {
    setLoading(true);
    if (tab === "overview" || tab === "users") {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setUsers(data || []);
    }
    if (tab === "overview" || tab === "listings") {
      const { data } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
      setListings(data || []);
    }
    if (tab === "orders" || tab === "overview") {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      setOrders(data || []);
    }
    if (tab === "disputes") {
      const { data } = await supabase.from("disputes").select("*").order("created_at", { ascending: false });
      setDisputes(data || []);
    }
    if (tab === "wallet" || tab === "withdraws") {
      const { data } = await supabase.from("wallet_transactions").select("*").eq("status", "pending").order("created_at", { ascending: false });
      if (tab === "wallet") setPendingTx(data?.filter(t => t.type === "credit") || []);
      if (tab === "withdraws") setPendingWithdraws(data?.filter(t => t.type === "debit") || []);
    }
    if (tab === "overview") {
      const [u, l, o, p] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("listings").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setCounts({ users: u.count || 0, listings: l.count || 0, orders: o.count || 0, pendingListings: p.count || 0 });
    }
    setLoading(false);
  };

  // Actions
  const banUser = async (id: string, currentStatus: boolean) => {
    await supabase.from("profiles").update({ is_banned: !currentStatus }).eq("id", id);
    showToast("info", !currentStatus ? "ইউজার ব্যান হয়েছে" : "ইউজার আনব্যান হয়েছে");
    fetchData();
  };
  const deleteUser = async (id: string) => {
    if(!confirm("ইউজার ডিলিট করতে চান?")) return;
    await supabase.from("profiles").delete().eq("id", id);
    showToast("warning", "ইউজার ডিলিট হয়েছে");
    fetchData();
  };
  const approveListing = async (id: string) => {
    await supabase.from("listings").update({ status: "active" }).eq("id", id);
    showToast("success", "লিস্টিং অ্যাপ্রুভ হয়েছে");
    fetchData();
  };
  const rejectListing = async (id: string) => {
    await supabase.from("listings").update({ status: "rejected" }).eq("id", id);
    showToast("warning", "লিস্টিং রিজেক্ট হয়েছে");
    fetchData();
  };
  const deleteListing = async (id: string) => {
    if(!confirm("লিস্টিং ডিলিট করতে চান?")) return;
    await supabase.from("listings").delete().eq("id", id);
    showToast("warning", "লিস্টিং ডিলিট হয়েছে");
    fetchData();
  };
  const cancelOrder = async (id: string) => {
    if(!confirm("অর্ডার ক্যান্সেল করতে চান?")) return;
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
    showToast("warning", "অর্ডার ক্যান্সেল হয়েছে");
    fetchData();
  };
  const approveTx = async (id: string, userId: string, amount: number) => {
    const { data: p } = await supabase.from("profiles").select("coin_balance").eq("id", userId).single();
    await supabase.from("profiles").update({ coin_balance: Number(p?.coin_balance || 0) + Number(amount) }).eq("id", userId);
    await supabase.from("wallet_transactions").update({ status: "completed" }).eq("id", id);
    showToast("success", "পেমেন্ট অ্যাপ্রুভ হয়েছে");
    fetchData();
  };
  const rejectTx = async (id: string) => {
    await supabase.from("wallet_transactions").update({ status: "failed" }).eq("id", id);
    showToast("warning", "পেমেন্ট রিজেক্ট হয়েছে");
    fetchData();
  };
  const approveWithdraw = async (id: string) => {
    await supabase.from("wallet_transactions").update({ status: "completed" }).eq("id", id);
    showToast("success", "উইথড্র সম্পন্ন");
    fetchData();
  };
  const rejectWithdraw = async (id: string, userId: string, amount: number) => {
    const { data: p } = await supabase.from("profiles").select("coin_balance").eq("id", userId).single();
    await supabase.from("profiles").update({ coin_balance: Number(p?.coin_balance || 0) + Number(amount) }).eq("id", userId);
    await supabase.from("wallet_transactions").update({ status: "failed" }).eq("id", id);
    showToast("warning", "উইথড্র রিজেক্ট হয়েছে");
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={toggleDarkMode} style={{ width: "34px", height: "34px", borderRadius: "50%", background: darkMode ? "#334155" : "#F8F9FE", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {darkMode ? <Sun size={15} color="#FFC857" /> : <Moon size={15} color="#6C63FF" />}
            </button>
            <button onClick={handleLogout} style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, #ef4444, #f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
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
      </div>
      <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 1000, opacity: menuOpen ? 1 : 0, visibility: menuOpen ? "visible" : "hidden", transition: "all 0.3s" }} />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "90px 20px 40px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", marginBottom: "4px" }}>{sidebarLinks.find((l) => l.key === tab)?.label}</h1>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>Admin Panel</p>
        </div>

        {/* OVERVIEW */}
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
            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "13px", marginTop: "40px" }}>বাম দিকের মেনু থেকে যেকোনো সেকশনে যান</p>
          </div>
        )}

        {/* USERS */}
        {tab === "users" && (
          <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px", padding: "18px" }}>
            {loading ? <Loader2 size={28} color="var(--muted)" /> : users.map((u) => (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--bg)", borderRadius: "11px", border: "1px solid var(--border)", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{u.name || "No Name"} ({u.role})</p>
                  <p style={{ fontSize: "12px", color: "var(--muted)" }}>{u.email} · ৳{u.coin_balance}</p>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => banUser(u.id, u.is_banned)} style={{ padding: "6px 12px", borderRadius: "7px", background: u.is_banned ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: u.is_banned ? "#10b981" : "#ef4444", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer" }}>
                    {u.is_banned ? "আনব্যান" : "ব্যান"}
                  </button>
                  <button onClick={() => deleteUser(u.id)} style={{ padding: "6px 12px", borderRadius: "7px", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer" }}>
                    ডিলিট
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LISTINGS */}
        {tab === "listings" && (
          <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px", padding: "18px" }}>
            {loading ? <Loader2 size={28} color="var(--muted)" /> : listings.map((l) => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "var(--bg)", borderRadius: "11px", border: "1px solid var(--border)", flexWrap: "wrap", marginBottom: "10px" }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text)" }}>{l.title}</p>
                  <p style={{ fontSize: "11.5px", color: "var(--muted)" }}>৳{Number(l.price).toLocaleString()} · Status: {l.status}</p>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {l.status === "pending" && (
                    <>
                      <button onClick={() => approveListing(l.id)} style={{ padding: "6px 11px", borderRadius: "7px", background: "rgba(16,185,129,0.1)", color: "#10b981", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer" }}>অ্যাপ্রুভ</button>
                      <button onClick={() => rejectListing(l.id)} style={{ padding: "6px 11px", borderRadius: "7px", background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer" }}>রিজেক্ট</button>
                    </>
                  )}
                  <button onClick={() => deleteListing(l.id)} style={{ padding: "6px 11px", borderRadius: "7px", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer" }}>ডিলিট</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ORDERS */}
        {tab === "orders" && (
          <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px", padding: "18px" }}>
            {loading ? <Loader2 size={28} color="var(--muted)" /> : orders.map((o) => (
              <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--bg)", borderRadius: "11px", border: "1px solid var(--border)", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>অর্ডার #{o.id.slice(0, 8)} - ৳{Number(o.amount).toLocaleString()}</p>
                  <p style={{ fontSize: "11.5px", color: "var(--muted)" }}>Status: {o.status} | Buyer: {o.buyer_id.slice(0, 8)}</p>
                </div>
                {o.status !== "cancelled" && o.status !== "completed" && (
                  <button onClick={() => cancelOrder(o.id)} style={{ padding: "6px 12px", borderRadius: "7px", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer" }}>
                    ক্যান্সেল
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* DISPUTES */}
        {tab === "disputes" && (
          <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px", padding: "18px" }}>
            {loading ? <Loader2 size={28} color="var(--muted)" /> : disputes.length === 0 ? <p style={{ color: "var(--muted)" }}>কোনো ডিসপিউট নেই</p> : disputes.map((d) => (
              <div key={d.id} style={{ padding: "12px", background: "rgba(239,68,68,0.05)", borderRadius: "11px", border: "1px solid rgba(239,68,68,0.2)", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>রিজন: {d.reason}</p>
                  <p style={{ fontSize: "11.5px", color: "var(--muted)" }}>Order: {d.order_id.slice(0, 8)} | Status: {d.status}</p>
                </div>
                <button onClick={() => showToast("info", "শীঘ্রই আসছে")} style={{ padding: "6px 12px", borderRadius: "7px", background: "rgba(16,185,129,0.1)", color: "#10b981", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer" }}>
                  রিজলভ
                </button>
              </div>
            ))}
          </div>
        )}

        {/* WALLET */}
        {tab === "wallet" && (
          <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px", padding: "18px" }}>
             {loading ? <Loader2 size={28} color="var(--muted)" /> : pendingTx.map((tx) => (
              <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--bg)", borderRadius: "11px", border: "1px solid var(--border)", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{tx.reason}</p>
                  <p style={{ fontSize: "11.5px", color: "var(--muted)" }}>৳{Number(tx.amount).toLocaleString()}</p>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => approveTx(tx.id, tx.user_id, tx.amount)} style={{ padding: "6px 12px", borderRadius: "7px", background: "rgba(16,185,129,0.1)", color: "#10b981", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer" }}>অ্যাপ্রুভ</button>
                  <button onClick={() => rejectTx(tx.id)} style={{ padding: "6px 12px", borderRadius: "7px", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer" }}>রিজেক্ট</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WITHDRAWS */}
        {tab === "withdraws" && (
          <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px", padding: "18px" }}>
             {loading ? <Loader2 size={28} color="var(--muted)" /> : pendingWithdraws.map((tx) => (
              <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--bg)", borderRadius: "11px", border: "1px solid var(--border)", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{tx.reason}</p>
                  <p style={{ fontSize: "11.5px", color: "var(--muted)" }}>৳{Number(tx.amount).toLocaleString()}</p>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => approveWithdraw(tx.id)} style={{ padding: "6px 12px", borderRadius: "7px", background: "rgba(16,185,129,0.1)", color: "#10b981", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer" }}>পাঠানো হয়েছে</button>
                  <button onClick={() => rejectWithdraw(tx.id, tx.user_id, tx.amount)} style={{ padding: "6px 12px", borderRadius: "7px", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer" }}>রিজেক্ট</button>
                </div>
              </div>
            ))}
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
