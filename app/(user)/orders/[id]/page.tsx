"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft, Shield, CheckCircle2, Clock, AlertTriangle, Package,
  KeyRound, User, ArrowRight, Loader2, MessageCircle, CreditCard, Flag
} from "lucide-react";

const statusSteps = [
  { key: "paid", label: "পেমেন্ট সম্পন্ন", icon: CreditCard },
  { key: "delivered", label: "হ্যান্ডওভার", icon: Package },
  { key: "completed", label: "সম্পন্ন", icon: CheckCircle2 },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  const [buyer, setBuyer] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    init();
  }, [orderId]);

  useEffect(() => {
    if (!order?.auto_complete_at) return;
    const timer = setInterval(() => {
      const end = new Date(order.auto_complete_at).getTime();
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft("সময় শেষ");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}ঘ ${m}মি ${s}সে`);
    }, 1000);
    return () => clearInterval(timer);
  }, [order]);

  const init = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setCurrentUser(user);

    const { data: o, error: oErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (oErr || !o) {
      setError("অর্ডার পাওয়া যায়নি");
      setLoading(false);
      return;
    }
    setOrder(o);

    const { data: l } = await supabase.from("listings").select("*").eq("id", o.listing_id).single();
    setListing(l);

    const { data: b } = await supabase.from("profiles").select("id, name, email").eq("id", o.buyer_id).single();
    setBuyer(b);

    const { data: s } = await supabase.from("profiles").select("id, name, email").eq("id", o.seller_id).single();
    setSeller(s);

    setLoading(false);
  };

  const isBuyer = currentUser?.id === order?.buyer_id;
  const isSeller = currentUser?.id === order?.seller_id;

  const handleSellerHandover = async () => {
    setActionLoading(true);
    const autoComplete = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    const { error: e } = await supabase
      .from("orders")
      .update({ status: "delivered", delivered_at: new Date().toISOString(), auto_complete_at: autoComplete })
      .eq("id", orderId);

    if (e) { setError(e.message); setActionLoading(false); return; }

    await supabase.from("listings").update({ status: "sold" }).eq("id", order.listing_id);

    setActionLoading(false);
    init();
  };

  const handleBuyerConfirm = async () => {
    setActionLoading(true);
    const { error: e } = await supabase
      .from("orders")
      .update({ status: "completed", confirmed_at: new Date().toISOString() })
      .eq("id", orderId);

    if (e) { setError(e.message); setActionLoading(false); return; }

    // Seller-এর wallet-এ টাকা
    const sellerAmount = order.amount - (order.commission || 0);

    const { data: sellerProfile } = await supabase.from("profiles").select("coin_balance").eq("id", order.seller_id).single();

    if (sellerProfile) {
      await supabase
        .from("profiles")
        .update({ coin_balance: (sellerProfile.coin_balance || 0) + sellerAmount })
        .eq("id", order.seller_id);
    }

    await supabase.from("wallet_transactions").insert({
      user_id: order.seller_id,
      type: "credit",
      amount: sellerAmount,
      reason: `অর্ডার #${order.id.slice(0, 8)} সম্পন্ন`,
      order_id: order.id,
      status: "completed",
    });

    setActionLoading(false);
    init();
  };

  const handleDispute = async () => {
    setActionLoading(true);
    const { error: e } = await supabase
      .from("orders")
      .update({ status: "disputed" })
      .eq("id", orderId);
    if (e) setError(e.message);
    setActionLoading(false);
    init();
  };

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={36} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
        <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <Header />
        <div style={{ padding: "120px 20px", textAlign: "center" }}>
          <AlertTriangle size={48} color="var(--muted)" style={{ marginBottom: "16px" }} />
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>{error || "অর্ডার পাওয়া যায়নি"}</h1>
          <Link href="/dashboard" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>← ড্যাশবোর্ডে ফিরে যান</Link>
        </div>
        <Footer />
      </main>
    );
  }

  const currentStepIdx = order.status === "paid" ? 0 : order.status === "delivered" ? 1 : order.status === "completed" ? 2 : 0;

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />

      <div style={{ flex: 1, maxWidth: "1000px", margin: "0 auto", padding: "90px 20px 40px", width: "100%" }}>

        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--muted)", textDecoration: "none", marginBottom: "16px", fontWeight: 500 }}>
          <ArrowLeft size={15} /> ড্যাশবোর্ডে ফিরে যান
        </Link>

        {error && (
          <div style={{ padding: "12px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "11px", fontSize: "13px", color: "#ef4444", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {/* Header */}
        <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "18px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
            <div>
              <p style={{ fontSize: "11.5px", color: "var(--muted)", fontWeight: 600, marginBottom: "3px" }}>অর্ডার</p>
              <h1 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>#{order.id.slice(0, 8).toUpperCase()}</h1>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "11.5px", color: "var(--muted)", marginBottom: "3px" }}>মোট</p>
              <p style={{ fontSize: "20px", fontWeight: 800, color: "#6C63FF" }}>৳{order.amount?.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", marginTop: "16px" }}>
            <div style={{ position: "absolute", top: "18px", left: "10%", right: "10%", height: "3px", background: "var(--border)" }} />
            <div style={{ position: "absolute", top: "18px", left: "10%", width: `${(currentStepIdx / 2) * 80}%`, height: "3px", background: "linear-gradient(90deg, #6C63FF, #10b981)", transition: "width 0.5s" }} />

            {statusSteps.map((s, i) => {
              const Icon = s.icon;
              const active = i <= currentStepIdx;
              return (
                <div key={s.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: active ? "linear-gradient(135deg, #6C63FF, #d946ef)" : "var(--card)", border: active ? "none" : "2px solid var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: active ? "0 6px 16px rgba(108,99,255,0.35)" : "none", transition: "all 0.3s" }}>
                    <Icon size={16} color={active ? "white" : "var(--muted)"} />
                  </div>
                  <p style={{ fontSize: "11.5px", fontWeight: active ? 700 : 500, color: active ? "var(--text)" : "var(--muted)", marginTop: "8px", textAlign: "center" }}>{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timer */}
        {order.status === "delivered" && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1.5px solid rgba(245,158,11,0.3)", borderRadius: "16px", padding: "18px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <Clock size={18} color="#f59e0b" />
              <p style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text)" }}>অটো-কমপ্লিট টাইমার</p>
            </div>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "10px" }}>
              {isBuyer ? "৭২ ঘণ্টার মধ্যে যাচাই করে কনফার্ম করুন। সময় শেষে স্বয়ংক্রিয়ভাবে সম্পন্ন হবে।" : "ক্রেতার কনফার্মের জন্য অপেক্ষা করুন।"}
            </p>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#f59e0b", fontVariantNumeric: "tabular-nums" }}>{timeLeft}</div>
          </div>
        )}

        {/* Order Details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px" }} className="order-grid">

          <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "18px", padding: "22px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text)", marginBottom: "14px" }}>অর্ডার তথ্য</h2>

            {listing && (
              <div style={{ marginBottom: "16px", padding: "14px", background: "var(--bg)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text)", marginBottom: "5px" }}>{listing.title}</p>
                <p style={{ fontSize: "11.5px", color: "var(--muted)" }}>{listing.followers?.toLocaleString()} ফলোয়ার · {listing.country}</p>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
              <div>
                <p style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, marginBottom: "4px" }}>ক্রেতা</p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{buyer?.name || buyer?.email?.split("@")[0] || "—"}</p>
              </div>
              <div>
                <p style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, marginBottom: "4px" }}>বিক্রেতা</p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{seller?.name || seller?.email?.split("@")[0] || "—"}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <p style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, marginBottom: "4px" }}>অ্যামাউন্ট</p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>৳{order.amount?.toLocaleString()}</p>
              </div>
              <div>
                <p style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, marginBottom: "4px" }}>কমিশন</p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>৳{order.commission?.toLocaleString()}</p>
              </div>
            </div>

            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
              <p style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, marginBottom: "6px" }}>হ্যান্ডওভার মেথড</p>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>
                {order.handover_method === "backup_code" ? "2FA Backup Code" : order.handover_method === "live_relay" ? "Live Code Relay" : order.handover_method === "2fa_off" ? "2FA বন্ধ" : "—"}
              </p>
            </div>
          </div>

          {/* Action Sidebar */}
          <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "18px", padding: "22px", position: "sticky", top: "96px", height: "fit-content" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text)", marginBottom: "14px" }}>পরবর্তী ধাপ</h2>

            {order.status === "paid" && isSeller && (
              <>
                <p style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "14px", lineHeight: 1.6 }}>
                  টাকা escrow-তে জমা হয়েছে। এখন অ্যাকাউন্ট হ্যান্ডওভার করুন।
                </p>
                <button onClick={handleSellerHandover} disabled={actionLoading} className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: "13.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", marginBottom: "10px", opacity: actionLoading ? 0.7 : 1 }}>
                  <KeyRound size={15} /> {actionLoading ? "প্রসেস..." : "হ্যান্ডওভার সম্পন্ন"}
                </button>
              </>
            )}

            {order.status === "paid" && isBuyer && (
              <p style={{ fontSize: "12.5px", color: "var(--muted)", lineHeight: 1.6 }}>
                বিক্রেতা অ্যাকাউন্ট হ্যান্ডওভার করছে। অপেক্ষা করুন।
              </p>
            )}

            {order.status === "delivered" && isBuyer && (
              <>
                <p style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "14px", lineHeight: 1.6 }}>
                  অ্যাকাউন্ট যাচাই করুন। ঠিক থাকলে কনফার্ম করুন — টাকা বিক্রেতাকে যাবে।
                </p>
                <button onClick={handleBuyerConfirm} disabled={actionLoading} className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: "13.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", marginBottom: "10px", opacity: actionLoading ? 0.7 : 1 }}>
                  <CheckCircle2 size={15} /> {actionLoading ? "প্রসেস..." : "কনফার্ম রিসিভড"}
                </button>
                <button onClick={handleDispute} disabled={actionLoading} style={{ width: "100%", padding: "11px", borderRadius: "10px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                  <Flag size={14} /> সমস্যা রিপোর্ট
                </button>
              </>
            )}

            {order.status === "delivered" && isSeller && (
              <p style={{ fontSize: "12.5px", color: "var(--muted)", lineHeight: 1.6 }}>
                ক্রেতা যাচাই করছে। কনফার্ম হলে টাকা আপনার wallet-এ যাবে।
              </p>
            )}

            {order.status === "completed" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <CheckCircle2 size={30} color="#10b981" />
                </div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>সম্পন্ন হয়েছে</p>
                <p style={{ fontSize: "12px", color: "var(--muted)" }}>লেনদেন সফলভাবে সম্পন্ন</p>
              </div>
            )}

            {order.status === "disputed" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <AlertTriangle size={30} color="#ef4444" />
                </div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>ডিসপিউট চলছে</p>
                <p style={{ fontSize: "12px", color: "var(--muted)" }}>অ্যাডমিন তদন্ত করছে</p>
              </div>
            )}

            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--muted)" }}>
              <Shield size={12} color="#10b981" /> এসক্রো সুরক্ষিত
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        @media (max-width: 900px) {
          .order-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
