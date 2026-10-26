"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import {
  Wallet, TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownLeft,
  Package, ListChecks, CheckCircle2, Clock, Eye, Loader2, ArrowRight
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [ordersAsBuyer, setOrdersAsBuyer] = useState<any[]>([]);
  const [ordersAsSeller, setOrdersAsSeller] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"transactions" | "listings" | "orders" | "sales">("transactions");

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setUser(user);

    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(p);

    const { data: l } = await supabase.from("listings").select("*").eq("seller_id", user.id).order("created_at", { ascending: false });
    setListings(l || []);

    const { data: ob } = await supabase.from("orders").select("*").eq("buyer_id", user.id).order("created_at", { ascending: false });
    setOrdersAsBuyer(ob || []);

    const { data: os } = await supabase.from("orders").select("*").eq("seller_id", user.id).order("created_at", { ascending: false });
    setOrdersAsSeller(os || []);

    const { data: tx } = await supabase.from("wallet_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
    setTransactions(tx || []);

    setLoading(false);
  };

  const balance = profile?.coin_balance || 0;
  const totalEarned = transactions.filter(t => t.type === "credit").reduce((s, t) => s + Number(t.amount), 0);
  const totalSpent = transactions.filter(t => t.type === "debit").reduce((s, t) => s + Number(t.amount), 0);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={36} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
        <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />

      <div style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", padding: "96px 20px 40px", width: "100%" }}>

        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800, color: "var(--text)", marginBottom: "6px", letterSpacing: "-0.02em" }}>
            ড্যাশবোর্ড
          </h1>
          <p style={{ fontSize: "14px", color: "var(--muted)" }}>আপনার অ্যাকাউন্টের সারসংক্ষেপ</p>
        </div>

        {/* Profile + Wallet */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "24px" }}>
          <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "20px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "22px", fontWeight: 800 }}>
                {(profile?.name || user?.email || "U").charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text)", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile?.name || "ব্যবহারকারী"}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
              </div>
            </div>
            <Link href="/profile" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", padding: "10px", borderRadius: "10px", border: "1.5px solid var(--border-strong)", color: "var(--text)", fontSize: "13.5px", fontWeight: 600, textDecoration: "none" }}>
              প্রোফাইল সম্পাদনা
            </Link>
          </div>

          <div style={{ background: "linear-gradient(135deg, #6C63FF 0%, #9333ea 50%, #d946ef 100%)", borderRadius: "20px", padding: "24px", color: "white", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(40px)" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", opacity: 0.9 }}>
                <Wallet size={16} />
                <span style={{ fontSize: "13px", fontWeight: 500 }}>ওয়ালেট ব্যালেন্স</span>
              </div>
              <div style={{ fontSize: "36px", fontWeight: 800, marginBottom: "20px", letterSpacing: "-0.03em" }}>
                ৳{balance.toLocaleString()}
              </div>
              <Link href="/wallet" style={{ display: "block", textAlign: "center", padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.2)", color: "white", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
                বিস্তারিত দেখুন
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          {[
            { icon: TrendingUp, label: "মোট আয়", value: totalEarned, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
            { icon: TrendingDown, label: "মোট খরচ", value: totalSpent, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
            { icon: Clock, label: "সক্রিয় লিস্টিং", value: listings.filter(l => l.status === "active").length, color: "#6C63FF", bg: "rgba(108,99,255,0.1)", isCount: true },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px", padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} color={s.color} />
                  </div>
                  <span style={{ fontSize: "13px", color: "var(--muted)", fontWeight: 500 }}>{s.label}</span>
                </div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)" }}>
                  {s.isCount ? s.value : `৳${Number(s.value).toLocaleString()}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "20px", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: "1.5px solid var(--border)", overflowX: "auto" }}>
            {[
              { key: "transactions", label: "লেনদেন", icon: Wallet },
              { key: "listings", label: `আমার লিস্টিং (${listings.length})`, icon: ListChecks },
              { key: "orders", label: `কেনাকাটা (${ordersAsBuyer.length})`, icon: Package },
              { key: "sales", label: `বিক্রয় (${ordersAsSeller.length})`, icon: TrendingUp },
            ].map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key as any)} style={{ flex: 1, minWidth: "130px", padding: "16px 20px", background: "transparent", border: "none", borderBottom: active ? "2.5px solid var(--primary)" : "2.5px solid transparent", color: active ? "var(--primary)" : "var(--muted)", fontSize: "13.5px", fontWeight: active ? 700 : 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", whiteSpace: "nowrap" }}>
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </div>

          <div style={{ padding: "20px" }}>

            {tab === "transactions" && (
              transactions.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "30px" }}>কোনো লেনদেন নেই</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {transactions.map((tx) => {
                    const isCredit = tx.type === "credit";
                    const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;
                    return (
                      <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "11px", background: "var(--bg)", border: "1px solid var(--border)" }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: isCredit ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={17} color={isCredit ? "#10b981" : "#ef4444"} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text)", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.reason || "লেনদেন"}</p>
                          <p style={{ fontSize: "11.5px", color: "var(--muted)" }}>{new Date(tx.created_at).toLocaleDateString("bn-BD")}</p>
                        </div>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: isCredit ? "#10b981" : "#ef4444" }}>
                          {isCredit ? "+" : "−"}৳{Number(tx.amount).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {tab === "listings" && (
              listings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px" }}>
                  <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "14px" }}>কোনো লিস্টিং নেই</p>
                  <Link href="/create-listing" className="btn-primary" style={{ padding: "10px 20px", fontSize: "13px", textDecoration: "none", display: "inline-block" }}>নতুন লিস্টিং</Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {listings.map((l) => (
                    <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "11px", background: "var(--bg)", border: "1px solid var(--border)", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: "180px" }}>
                        <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>{l.title}</p>
                        <p style={{ fontSize: "11.5px", color: "var(--muted)" }}>{l.platform} · {l.followers?.toLocaleString()} ফলোয়ার</p>
                      </div>
                      <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--primary)" }}>৳{Number(l.price).toLocaleString()}</span>
                      <span style={{ fontSize: "10.5px", fontWeight: 700, padding: "3px 7px", borderRadius: "5px", color: l.status === "active" ? "#10b981" : l.status === "sold" ? "#6C63FF" : l.status === "pending" ? "#f59e0b" : "#ef4444", background: l.status === "active" ? "rgba(16,185,129,0.1)" : l.status === "sold" ? "rgba(108,99,255,0.1)" : l.status === "pending" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)" }}>
                        {l.status === "active" ? "সক্রিয়" : l.status === "sold" ? "বিক্রি" : l.status === "pending" ? "পেন্ডিং" : "রিজেক্টেড"}
                      </span>
                      <Link href={`/listing/${l.id}`} style={{ padding: "6px 12px", borderRadius: "7px", background: "rgba(108,99,255,0.1)", color: "#6C63FF", fontSize: "11.5px", fontWeight: 600, textDecoration: "none" }}>দেখুন</Link>
                    </div>
                  ))}
                </div>
              )
            )}

            {tab === "orders" && (
              ordersAsBuyer.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "30px" }}>কোনো অর্ডার নেই</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {ordersAsBuyer.map((o) => (
                    <Link key={o.id} href={`/orders/${o.id}`} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: "11px", background: "var(--bg)", border: "1px solid var(--border)", textDecoration: "none", flexWrap: "wrap" }}>
                      <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(108,99,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Package size={17} color="#6C63FF" />
                      </div>
                      <div style={{ flex: 1, minWidth: "180px" }}>
                        <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>অর্ডার #{o.id.slice(0, 8).toUpperCase()}</p>
                        <p style={{ fontSize: "11.5px", color: "var(--muted)" }}>{new Date(o.created_at).toLocaleDateString("bn-BD")}</p>
                      </div>
                      <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--primary)" }}>৳{Number(o.amount).toLocaleString()}</span>
                      <span style={{ fontSize: "10.5px", fontWeight: 700, padding: "3px 7px", borderRadius: "5px", color: o.status === "completed" ? "#10b981" : o.status === "delivered" ? "#f59e0b" : o.status === "disputed" ? "#ef4444" : "#6C63FF", background: o.status === "completed" ? "rgba(16,185,129,0.1)" : o.status === "delivered" ? "rgba(245,158,11,0.1)" : o.status === "disputed" ? "rgba(239,68,68,0.1)" : "rgba(108,99,255,0.1)" }}>
                        {o.status === "completed" ? "সম্পন্ন" : o.status === "delivered" ? "হ্যান্ডওভার" : o.status === "disputed" ? "ডিসপিউট" : o.status === "paid" ? "পেইড" : o.status}
                      </span>
                      <ArrowRight size={14} color="var(--muted)" />
                    </Link>
                  ))}
                </div>
              )
            )}

            {tab === "sales" && (
              ordersAsSeller.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "30px" }}>কোনো বিক্রয় নেই</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {ordersAsSeller.map((o) => (
                    <Link key={o.id} href={`/orders/${o.id}`} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: "11px", background: "var(--bg)", border: "1px solid var(--border)", textDecoration: "none", flexWrap: "wrap" }}>
                      <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <TrendingUp size={17} color="#10b981" />
                      </div>
                      <div style={{ flex: 1, minWidth: "180px" }}>
                        <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>অর্ডার #{o.id.slice(0, 8).toUpperCase()}</p>
                        <p style={{ fontSize: "11.5px", color: "var(--muted)" }}>{new Date(o.created_at).toLocaleDateString("bn-BD")}</p>
                      </div>
                      <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--primary)" }}>৳{Number(o.amount).toLocaleString()}</span>
                      <span style={{ fontSize: "10.5px", fontWeight: 700, padding: "3px 7px", borderRadius: "5px", color: o.status === "completed" ? "#10b981" : o.status === "delivered" ? "#f59e0b" : o.status === "disputed" ? "#ef4444" : "#6C63FF", background: o.status === "completed" ? "rgba(16,185,129,0.1)" : o.status === "delivered" ? "rgba(245,158,11,0.1)" : o.status === "disputed" ? "rgba(239,68,68,0.1)" : "rgba(108,99,255,0.1)" }}>
                        {o.status === "completed" ? "সম্পন্ন" : o.status === "delivered" ? "হ্যান্ডওভার" : o.status === "disputed" ? "ডিসপিউট" : o.status === "paid" ? "পেইড" : o.status}
                      </span>
                      <ArrowRight size={14} color="var(--muted)" />
                    </Link>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
