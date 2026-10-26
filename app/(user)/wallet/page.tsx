"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import {
  Wallet, Plus, ArrowDownLeft, ArrowUpRight, Clock, X,
  Smartphone, Loader2, Download, Copy, CheckCircle2, AlertCircle
} from "lucide-react";

const ADMIN_BKASH = "01572972953";
const ADMIN_NAGAD = "01572972953";

export default function WalletPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [buyStep, setBuyStep] = useState<1 | 2>(1);
  const [buyAmount, setBuyAmount] = useState("");
  const [txnId, setTxnId] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad">("bkash");
  const [copied, setCopied] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setUser(user);

    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(p);

    const { data: tx } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setTransactions(tx || []);

    setLoading(false);
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(paymentMethod === "bkash" ? ADMIN_BKASH : ADMIN_NAGAD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBuyStep1 = () => {
    setError("");
    const amount = parseFloat(buyAmount);
    if (!amount || amount < 100) {
      setError("সর্বনিম্ন ১০০ টাকা");
      return;
    }
    setBuyStep(2);
  };

  const handleBuySubmit = async () => {
    setError("");
    if (!txnId || txnId.length < 6) {
      setError("সঠিক Transaction ID দিন");
      return;
    }
    if (!userPhone || userPhone.length < 11) {
      setError("সঠিক ফোন নম্বর দিন");
      return;
    }

    const amount = parseFloat(buyAmount);
    setProcessing(true);

    // Pending transaction তৈরি (balance এখনো বাড়বে না)
    const { error: e } = await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "credit",
      amount: amount,
      reason: `${paymentMethod.toUpperCase()} কয়েন কেনা (TXN: ${txnId}, ফোন: ${userPhone})`,
      status: "pending",
    });

    setProcessing(false);

    if (e) {
      setError(e.message);
      return;
    }

    setShowBuyModal(false);
    setBuyStep(1);
    setBuyAmount("");
    setTxnId("");
    setUserPhone("");
    setSuccess("✅ পেমেন্ট রিকোয়েস্ট পাঠানো হয়েছে! অ্যাডমিন verify করে coin যোগ করবে (২৪ ঘণ্টার মধ্যে)।");
    init();
    setTimeout(() => setSuccess(""), 6000);
  };

  const handleWithdraw = async () => {
    setError("");
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      setError("সঠিক পরিমাণ দিন");
      return;
    }
    if (amount > Number(profile.coin_balance || 0)) {
      setError("পর্যাপ্ত balance নেই");
      return;
    }
    if (!withdrawPhone || withdrawPhone.length < 11) {
      setError("সঠিক নম্বর দিন");
      return;
    }

    setProcessing(true);
    const newBalance = Number(profile.coin_balance || 0) - amount;
    const { error: e1 } = await supabase.from("profiles").update({ coin_balance: newBalance }).eq("id", user.id);

    if (e1) { setError(e1.message); setProcessing(false); return; }

    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "debit",
      amount: amount,
      reason: `উইথড্র (${withdrawPhone})`,
      status: "pending",
    });

    setProcessing(false);
    setShowWithdrawModal(false);
    setWithdrawAmount("");
    setWithdrawPhone("");
    setSuccess(`৳${amount} উইথড্র রিকোয়েস্ট পাঠানো হয়েছে ✅`);
    init();
    setTimeout(() => setSuccess(""), 4000);
  };

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={36} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
        <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  const balance = Number(profile?.coin_balance || 0);
  const totalIn = transactions.filter(t => t.type === "credit" && t.status === "completed").reduce((s, t) => s + Number(t.amount), 0);
  const totalOut = transactions.filter(t => t.type === "debit").reduce((s, t) => s + Number(t.amount), 0);
  const pending = transactions.filter(t => t.status === "pending").reduce((s, t) => s + Number(t.amount), 0);
  const filtered = filter === "all" ? transactions : transactions.filter(t => t.type === filter);
  const quickAmounts = [100, 500, 1000, 2000];

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />

      <div style={{ flex: 1, maxWidth: "1100px", margin: "0 auto", padding: "96px 20px 40px", width: "100%" }}>
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800, color: "var(--text)", marginBottom: "4px" }}>ওয়ালেট</h1>
          <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>ব্যালেন্স, লেনদেন ও পেমেন্ট ম্যানেজ করুন</p>
        </div>

        {success && (
          <div style={{ padding: "12px 14px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "11px", fontSize: "13px", color: "#10b981", fontWeight: 600, marginBottom: "16px" }}>
            {success}
          </div>
        )}

        {/* Balance */}
        <div style={{ background: "linear-gradient(135deg, #6C63FF 0%, #9333ea 50%, #d946ef 100%)", borderRadius: "22px", padding: "28px", color: "white", marginBottom: "20px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "240px", height: "240px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(50px)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", opacity: 0.9 }}>
              <Wallet size={18} />
              <span style={{ fontSize: "14px" }}>মোট ব্যালেন্স</span>
            </div>
            <div style={{ fontSize: "clamp(32px, 5vw, 44px)", fontWeight: 800, marginBottom: "20px", letterSpacing: "-0.03em" }}>৳{balance.toLocaleString()}</div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button onClick={() => { setShowBuyModal(true); setBuyStep(1); setError(""); }} style={{ padding: "12px 22px", borderRadius: "12px", background: "white", color: "#6C63FF", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px" }}>
                <Plus size={16} /> কয়েন কিনুন
              </button>
              <button onClick={() => { setShowWithdrawModal(true); setError(""); }} style={{ padding: "12px 22px", borderRadius: "12px", background: "rgba(255,255,255,0.2)", color: "white", fontSize: "14px", fontWeight: 700, border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px" }}>
                <Download size={16} /> উইথড্র
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "20px" }}>
          {[
            { icon: ArrowDownLeft, label: "মোট আয়", value: totalIn, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
            { icon: ArrowUpRight, label: "মোট খরচ", value: totalOut, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
            { icon: Clock, label: "পেন্ডিং", value: pending, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px", padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "10px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={17} color={s.color} />
                  </div>
                  <span style={{ fontSize: "12.5px", color: "var(--muted)" }}>{s.label}</span>
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)" }}>৳{s.value.toLocaleString()}</div>
              </div>
            );
          })}
        </div>

        {/* Transactions */}
        <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "20px", overflow: "hidden" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text)" }}>লেনদেনের ইতিহাস</h2>
            <div style={{ display: "flex", gap: "6px", background: "var(--bg)", borderRadius: "10px", padding: "4px" }}>
              {[
                { key: "all", label: "সব" },
                { key: "credit", label: "আয়" },
                { key: "debit", label: "খরচ" },
              ].map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key as any)} style={{ padding: "7px 14px", borderRadius: "7px", background: filter === f.key ? "var(--card)" : "transparent", color: filter === f.key ? "var(--primary)" : "var(--muted)", border: "none", fontSize: "12.5px", fontWeight: 600, cursor: "pointer" }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding: "12px" }}>
            {filtered.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "40px" }}>কোনো লেনদেন নেই</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {filtered.map((tx) => {
                  const isCredit = tx.type === "credit";
                  const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;
                  return (
                    <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px", background: "var(--bg)", border: "1px solid var(--border)" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: isCredit ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={19} color={isCredit ? "#10b981" : "#ef4444"} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text)", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.reason || "লেনদেন"}</p>
                        <p style={{ fontSize: "11.5px", color: "var(--muted)" }}>{new Date(tx.created_at).toLocaleDateString("bn-BD")}</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: "14.5px", fontWeight: 700, color: isCredit ? "#10b981" : "#ef4444", marginBottom: "3px" }}>
                          {isCredit ? "+" : "−"}৳{Number(tx.amount).toLocaleString()}
                        </p>
                        <span style={{ fontSize: "10.5px", fontWeight: 600, padding: "2px 7px", borderRadius: "5px", color: tx.status === "completed" ? "#10b981" : tx.status === "pending" ? "#f59e0b" : "#ef4444", background: tx.status === "completed" ? "rgba(16,185,129,0.1)" : tx.status === "pending" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)" }}>
                          {tx.status === "completed" ? "সম্পন্ন" : tx.status === "pending" ? "পেন্ডিং" : "বাতিল"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* BUY MODAL */}
      {showBuyModal && (
        <div onClick={() => setShowBuyModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "22px", padding: "24px", width: "100%", maxWidth: "440px", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={() => setShowBuyModal(false)} style={{ position: "absolute", top: "14px", right: "14px", width: "30px", height: "30px", borderRadius: "8px", background: "var(--bg)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={16} color="var(--muted)" />
            </button>

            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text)", marginBottom: "4px" }}>কয়েন কিনুন</h3>
            <p style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "18px" }}>১ টাকা = ১ কয়েন</p>

            {error && <div style={{ padding: "10px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", fontSize: "12.5px", color: "#ef4444", marginBottom: "12px" }}>{error}</div>}

            {/* STEP 1: Amount + Method */}
            {buyStep === 1 && (
              <>
                <label style={labelStyle}>পরিমাণ (৳)</label>
                <div className="search-box" style={{ display: "flex", alignItems: "center", gap: "9px", padding: "11px 14px", marginBottom: "14px", border: "1.5px solid var(--border-strong)" }}>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--muted)" }}>৳</span>
                  <input type="number" placeholder="যেমন ৫০০" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "16px", fontWeight: 700, color: "var(--text)" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "18px" }}>
                  {quickAmounts.map((a) => (
                    <button key={a} onClick={() => setBuyAmount(a.toString())} style={{ padding: "9px", borderRadius: "9px", background: buyAmount === a.toString() ? "rgba(108,99,255,0.1)" : "var(--bg)", border: buyAmount === a.toString() ? "1.5px solid var(--primary)" : "1.5px solid var(--border)", color: buyAmount === a.toString() ? "var(--primary)" : "var(--text)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                      ৳{a}
                    </button>
                  ))}
                </div>

                <label style={labelStyle}>পেমেন্ট মেথড</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "18px" }}>
                  <button onClick={() => setPaymentMethod("bkash")} style={{ padding: "13px", borderRadius: "10px", background: paymentMethod === "bkash" ? "rgba(226,19,110,0.1)" : "var(--bg)", border: paymentMethod === "bkash" ? "2px solid #E2136E" : "1.5px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: paymentMethod === "bkash" ? "#E2136E" : "var(--text)", fontWeight: 700, fontSize: "13.5px" }}>
                    <Smartphone size={16} /> bKash
                  </button>
                  <button onClick={() => setPaymentMethod("nagad")} style={{ padding: "13px", borderRadius: "10px", background: paymentMethod === "nagad" ? "rgba(245,130,32,0.1)" : "var(--bg)", border: paymentMethod === "nagad" ? "2px solid #F58220" : "1.5px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: paymentMethod === "nagad" ? "#F58220" : "var(--text)", fontWeight: 700, fontSize: "13.5px" }}>
                    <Smartphone size={16} /> Nagad
                  </button>
                </div>

                <button onClick={handleBuyStep1} className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: "14px", fontWeight: 700 }}>
                  পরবর্তী ধাপ →
                </button>
              </>
            )}

            {/* STEP 2: Send Money Instructions */}
            {buyStep === 2 && (
              <>
                <div style={{ padding: "14px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "12px", marginBottom: "16px" }}>
                  <p style={{ fontSize: "12.5px", color: "var(--text)", lineHeight: 1.7, marginBottom: "8px" }}>
                    <strong>১.</strong> নিচের নম্বরে <strong>৳{buyAmount}</strong> পাঠান ({paymentMethod === "bkash" ? "bKash" : "Nagad"} → Send Money)
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "var(--card)", borderRadius: "9px", border: "1px solid var(--border)", marginBottom: "8px" }}>
                    <span style={{ flex: 1, fontSize: "16px", fontWeight: 800, color: paymentMethod === "bkash" ? "#E2136E" : "#F58220", letterSpacing: "0.02em" }}>
                      {paymentMethod === "bkash" ? ADMIN_BKASH : ADMIN_NAGAD}
                    </span>
                    <button onClick={copyNumber} style={{ padding: "6px 10px", borderRadius: "7px", background: "rgba(108,99,255,0.1)", color: "#6C63FF", border: "1px solid rgba(108,99,255,0.2)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11.5px", fontWeight: 700 }}>
                      {copied ? <><CheckCircle2 size={12} /> কপি</> : <><Copy size={12} /> কপি</>}
                    </button>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "var(--text)", lineHeight: 1.7 }}>
                    <strong>২.</strong> টাকা পাঠানোর পর <strong>Transaction ID</strong> ও আপনার <strong>ফোন নম্বর</strong> নিচে দিন
                  </p>
                </div>

                <label style={labelStyle}>Transaction ID</label>
                <div className="search-box" style={{ display: "flex", alignItems: "center", gap: "9px", padding: "11px 14px", marginBottom: "12px", border: "1.5px solid var(--border-strong)" }}>
                  <input type="text" placeholder="যেমন: 8N7A2X9K" value={txnId} onChange={(e) => setTxnId(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "14px", color: "var(--text)", fontWeight: 600 }} />
                </div>

                <label style={labelStyle}>আপনার ফোন নম্বর (যেটা দিয়ে পাঠিয়েছেন)</label>
                <div className="search-box" style={{ display: "flex", alignItems: "center", gap: "9px", padding: "11px 14px", marginBottom: "16px", border: "1.5px solid var(--border-strong)" }}>
                  <Smartphone size={15} color="var(--muted)" />
                  <input type="text" placeholder="01XXXXXXXXX" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "14px", color: "var(--text)" }} />
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setBuyStep(1)} style={{ padding: "12px 18px", borderRadius: "10px", background: "transparent", border: "1.5px solid var(--border-strong)", color: "var(--text)", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" }}>
                    ← পেছনে
                  </button>
                  <button onClick={handleBuySubmit} disabled={processing} className="btn-primary" style={{ flex: 1, padding: "12px", fontSize: "14px", fontWeight: 700, opacity: processing ? 0.7 : 1 }}>
                    {processing ? "পাঠানো হচ্ছে..." : "রিকোয়েস্ট পাঠান"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {showWithdrawModal && (
        <div onClick={() => setShowWithdrawModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "22px", padding: "24px", width: "100%", maxWidth: "420px", position: "relative" }}>
            <button onClick={() => setShowWithdrawModal(false)} style={{ position: "absolute", top: "14px", right: "14px", width: "30px", height: "30px", borderRadius: "8px", background: "var(--bg)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={16} color="var(--muted)" />
            </button>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text)", marginBottom: "4px" }}>উইথড্র</h3>
            <p style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "18px" }}>ব্যালেন্স: ৳{balance.toLocaleString()}</p>

            {error && <div style={{ padding: "10px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", fontSize: "12.5px", color: "#ef4444", marginBottom: "12px" }}>{error}</div>}

            <label style={labelStyle}>পরিমাণ (৳)</label>
            <div className="search-box" style={{ display: "flex", alignItems: "center", gap: "9px", padding: "11px 14px", marginBottom: "12px", border: "1.5px solid var(--border-strong)" }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--muted)" }}>৳</span>
              <input type="number" placeholder="৫০০" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "16px", fontWeight: 700, color: "var(--text)" }} />
            </div>

            <label style={labelStyle}>bKash/Nagad নম্বর</label>
            <div className="search-box" style={{ display: "flex", alignItems: "center", gap: "9px", padding: "11px 14px", marginBottom: "16px", border: "1.5px solid var(--border-strong)" }}>
              <Smartphone size={15} color="var(--muted)" />
              <input type="text" placeholder="01XXXXXXXXX" value={withdrawPhone} onChange={(e) => setWithdrawPhone(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "14px", color: "var(--text)" }} />
            </div>

            <p style={{ fontSize: "11.5px", color: "var(--muted)", marginBottom: "14px", lineHeight: 1.6 }}>
              ⏱️ ২৪-৪৮ ঘণ্টায় প্রসেস হবে। সর্বনিম্ন ৳৫০০।
            </p>

            <button onClick={handleWithdraw} disabled={processing} className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: "14px", fontWeight: 700, opacity: processing ? 0.7 : 1 }}>
              {processing ? "পাঠানো হচ্ছে..." : "উইথড্র রিকোয়েস্ট"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "7px" };
