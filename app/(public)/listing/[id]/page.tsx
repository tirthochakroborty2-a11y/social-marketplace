"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";
import {
  ArrowLeft, Video, Users, Music, CheckCircle2, Shield, Zap,
  MessageCircle, ShoppingCart, Calendar, Globe,
  TrendingUp, Lock, AlertCircle, X, Loader2, ChevronLeft, ChevronRight, LogIn
} from "lucide-react";

const platformLabels: Record<string, string> = {
  youtube: "ইউটিউব",
  facebook: "ফেসবুক",
  tiktok: "টিকটক",
  instagram: "ইনস্টাগ্রাম",
  other: "অন্যান্য",
};

const platformColors: Record<string, { color: string; bg: string; icon: any }> = {
  youtube: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: Video },
  facebook: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: Users },
  tiktok: { color: "#a855f7", bg: "rgba(168,85,247,0.1)", icon: Music },
  instagram: { color: "#ec4899", bg: "rgba(236,72,153,0.1)", icon: Video },
  other: { color: "#6C63FF", bg: "rgba(108,99,255,0.1)", icon: Globe },
};

export default function ListingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const listingId = params.id as string;

  const [listing, setListing] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [buying, setBuying] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchListing();
    checkUser();
  }, [listingId]);

  const fetchListing = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (error || !data) {
      setError("লিস্টিং পাওয়া যায়নি");
      setLoading(false);
      return;
    }
    setListing(data);

    const { data: sellerData } = await supabase
      .from("profiles")
      .select("id, name, email, created_at")
      .eq("id", data.seller_id)
      .single();
    setSeller(sellerData);

    setLoading(false);
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const handleBuyClick = () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setShowBuyModal(true);
  };

  const handleLoginRedirect = () => {
    // বর্তমান listing page-এ ফিরে আসার জন্য redirect URL
    const redirect = encodeURIComponent(`/listing/${listingId}`);
    router.push(`/login?redirect=${redirect}`);
  };

  const handleBuy = async () => {
    setError("");
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    if (currentUser.id === listing.seller_id) {
      setError("নিজের লিস্টিং কিনতে পারবেন না");
      return;
    }

    setBuying(true);

    const { error: reserveErr } = await supabase
      .from("listings")
      .update({ status: "reserved" })
      .eq("id", listingId)
      .eq("status", "active");

    if (reserveErr) {
      setError("এই লিস্টিং ইতিমধ্যে কেউ কিনেছে");
      showToast("error", "কেনা যায়নি", "এই লিস্টিং ইতিমধ্যে কেউ কিনেছে");
      setBuying(false);
      return;
    }

    const commission = listing.price * 0.05;
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        listing_id: listingId,
        buyer_id: currentUser.id,
        seller_id: listing.seller_id,
        amount: listing.price,
        commission: commission,
        status: "paid",
        handover_method: listing.handover_method,
      })
      .select()
      .single();

    if (orderErr) {
      setError(orderErr.message);
      setBuying(false);
      return;
    }

    showToast("success", "অর্ডার তৈরি!", "টাকা escrow-তে জমা হয়েছে ✅");
    setTimeout(() => router.push(`/orders/${order.id}`), 500);
  };

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={36} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
        <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  if (error && !listing) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <Header />
        <div style={{ padding: "120px 20px", textAlign: "center" }}>
          <AlertCircle size={48} color="var(--muted)" style={{ marginBottom: "16px" }} />
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>{error}</h1>
          <Link href="/browse" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>← ব্রাউজে ফিরে যান</Link>
        </div>
        <Footer />
      </main>
    );
  }

  const pc = platformColors[listing.platform] || platformColors.other;
  const Icon = pc.icon;
  const isOwner = currentUser?.id === listing.seller_id;
  const isSold = listing.status === "sold";
  const isReserved = listing.status === "reserved";

  const images: string[] = listing.images && Array.isArray(listing.images) ? listing.images : [];
  const hasImages = images.length > 0;

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />

      <div style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", padding: "80px 20px 40px", width: "100%" }}>

        <Link href="/browse" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--muted)", textDecoration: "none", marginBottom: "14px", fontWeight: 500 }}>
          <ArrowLeft size={15} /> ব্রাউজে ফিরে যান
        </Link>

        {error && (
          <div style={{ padding: "12px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "11px", fontSize: "13px", color: "#ef4444", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "20px", alignItems: "start" }} className="details-grid">

          {/* LEFT */}
          <div>
            {/* IMAGE */}
            <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "18px", overflow: "hidden", marginBottom: "16px" }}>
              {hasImages ? (
                <>
                  <div style={{ position: "relative", background: "#000", height: "420px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={images[activeImage]} alt={listing.title} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                    {images.length > 1 && (
                      <>
                        <button onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "38px", height: "38px", borderRadius: "50%", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ChevronLeft size={20} color="white" />
                        </button>
                        <button onClick={() => setActiveImage((activeImage + 1) % images.length)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", width: "38px", height: "38px", borderRadius: "50%", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ChevronRight size={20} color="white" />
                        </button>
                        <div style={{ position: "absolute", bottom: "12px", right: "12px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", padding: "5px 11px", borderRadius: "8px", color: "white", fontSize: "12px", fontWeight: 600 }}>
                          {activeImage + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div style={{ display: "flex", gap: "8px", padding: "12px", overflowX: "auto" }}>
                      {images.map((img, i) => (
                        <button key={i} onClick={() => setActiveImage(i)} style={{ width: "70px", height: "70px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, border: i === activeImage ? "2px solid #6C63FF" : "2px solid transparent", padding: 0, cursor: "pointer", background: "transparent" }}>
                          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ height: "280px", background: "linear-gradient(135deg, #6C63FF 0%, #9333ea 50%, #d946ef 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center", color: "white" }}>
                    <Icon size={48} style={{ marginBottom: "10px" }} />
                    <p style={{ fontSize: "15px", fontWeight: 600, opacity: 0.9 }}>{platformLabels[listing.platform] || listing.platform}</p>
                  </div>
                </div>
              )}
            </div>

            {/* TITLE */}
            <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "18px", padding: "22px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", padding: "5px 10px", borderRadius: "7px", background: pc.bg, color: pc.color, fontWeight: 700 }}>
                  <Icon size={13} /> {platformLabels[listing.platform]}
                </span>
                {listing.status === "active" && <span style={{ fontSize: "11px", padding: "4px 9px", borderRadius: "6px", background: "rgba(16,185,129,0.1)", color: "#10b981", fontWeight: 700 }}>✅ সক্রিয়</span>}
                {isSold && <span style={{ fontSize: "11px", padding: "4px 9px", borderRadius: "6px", background: "rgba(108,99,255,0.1)", color: "#6C63FF", fontWeight: 700 }}>💰 বিক্রি হয়েছে</span>}
                {isReserved && <span style={{ fontSize: "11px", padding: "4px 9px", borderRadius: "6px", background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontWeight: 700 }}>⏳ রিজার্ভড</span>}
              </div>

              <h1 style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 800, color: "var(--text)", marginBottom: "14px", lineHeight: 1.3, letterSpacing: "-0.02em" }}>{listing.title}</h1>

              {listing.account_link && (
                <a href={listing.account_link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "var(--primary)", textDecoration: "none", fontWeight: 600, background: "rgba(108,99,255,0.08)", padding: "7px 12px", borderRadius: "8px", marginBottom: "18px" }}>
                  <Lock size={13} /> অ্যাকাউন্ট লিংক দেখুন
                </a>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                <StatBox icon={Users} label="ফলোয়ার" value={listing.followers?.toLocaleString() || "0"} color="#6C63FF" />
                <StatBox icon={Calendar} label="তৈরি" value={new Date(listing.created_at).getFullYear().toString()} color="#10b981" />
                <StatBox icon={Globe} label="দেশ" value={listing.country || "বাংলাদেশ"} color="#f59e0b" />
                <StatBox icon={TrendingUp} label="মনিটাইজড" value={listing.monetized ? "হ্যাঁ" : "না"} color={listing.monetized ? "#10b981" : "#ef4444"} />
              </div>
            </div>

            {listing.description && (
              <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "18px", padding: "22px", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text)", marginBottom: "12px" }}>বিবরণ</h2>
                <p style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{listing.description}</p>
              </div>
            )}

            {seller && (
              <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "18px", padding: "22px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text)", marginBottom: "14px" }}>বিক্রেতার তথ্য</h2>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "20px", fontWeight: 800 }}>
                    {(seller.name || seller.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <h3 style={{ fontSize: "15.5px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>{seller.name || "ব্যবহারকারী"}</h3>
                    <p style={{ fontSize: "12px", color: "var(--muted)" }}>যোগদান: {new Date(seller.created_at).toLocaleDateString("bn-BD")}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div style={{ position: "sticky", top: "96px" }} className="details-sidebar">
            <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "18px", padding: "22px", marginBottom: "16px" }}>
              <p style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, marginBottom: "6px" }}>দাম</p>
              <div style={{ fontSize: "34px", fontWeight: 800, color: "#6C63FF", marginBottom: "18px", letterSpacing: "-0.03em" }}>৳{listing.price?.toLocaleString()}</div>

              {isOwner ? (
                <div style={{ padding: "12px", background: "rgba(108,99,255,0.1)", borderRadius: "10px", fontSize: "12.5px", color: "var(--primary)", fontWeight: 600, textAlign: "center" }}>এটি আপনার নিজের লিস্টিং</div>
              ) : isSold ? (
                <div style={{ padding: "12px", background: "rgba(239,68,68,0.1)", borderRadius: "10px", fontSize: "12.5px", color: "#ef4444", fontWeight: 600, textAlign: "center" }}>ইতিমধ্যে বিক্রি হয়ে গেছে</div>
              ) : isReserved ? (
                <div style={{ padding: "12px", background: "rgba(245,158,11,0.1)", borderRadius: "10px", fontSize: "12.5px", color: "#f59e0b", fontWeight: 600, textAlign: "center" }}>কেউ কিনতে শুরু করেছে</div>
              ) : (
                <button onClick={handleBuyClick} className="btn-primary" style={{ width: "100%", padding: "13px", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", marginBottom: "10px" }}>
                  <ShoppingCart size={16} /> এখনই কিনুন
                </button>
              )}

              <button onClick={() => { if (!currentUser) setShowLoginModal(true); }} style={{ width: "100%", padding: "12px", borderRadius: "11px", border: "1.5px solid var(--border-strong)", background: "transparent", color: "var(--text)", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                <MessageCircle size={15} /> মেসেজ দিন
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "16px", fontSize: "12px", color: "var(--muted)" }}>
                <Shield size={13} color="#10b981" /> এসক্রো সুরক্ষিত লেনদেন
              </div>
            </div>

            <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "18px", padding: "18px" }}>
              <h3 style={{ fontSize: "13.5px", fontWeight: 800, color: "var(--text)", marginBottom: "14px" }}>কেন নিরাপদ?</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { icon: Shield, text: "টাকা escrow-তে সুরক্ষিত", color: "#10b981" },
                  { icon: Zap, text: "৭২ ঘণ্টায় হ্যান্ডওভার", color: "#f59e0b" },
                  { icon: CheckCircle2, text: "কনফার্ম না করলে টাকা ফেরত", color: "#6C63FF" },
                ].map((b, i) => {
                  const BIcon = b.icon;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                      <BIcon size={15} color={b.color} style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span style={{ fontSize: "12.5px", color: "var(--text)", lineHeight: 1.5 }}>{b.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* LOGIN REQUIRED MODAL */}
      {showLoginModal && (
        <div onClick={() => setShowLoginModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "22px", padding: "32px 28px", width: "100%", maxWidth: "400px", position: "relative", textAlign: "center" }}>
            <button onClick={() => setShowLoginModal(false)} style={{ position: "absolute", top: "14px", right: "14px", width: "30px", height: "30px", borderRadius: "8px", background: "var(--bg)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={16} color="var(--muted)" />
            </button>

            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(108,99,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <LogIn size={30} color="#6C63FF" />
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)", marginBottom: "8px" }}>
              লগইন করুন
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--muted)", lineHeight: 1.6, marginBottom: "24px" }}>
              এই লিস্টিং কিনতে হলে আগে লগইন বা রেজিস্টার করতে হবে।
            </p>

            <button onClick={handleLoginRedirect} className="btn-primary" style={{ width: "100%", padding: "13px", fontSize: "14px", fontWeight: 700, marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
              <LogIn size={16} /> লগইন / রেজিস্টার
            </button>
            <button onClick={() => setShowLoginModal(false)} style={{ width: "100%", padding: "11px", borderRadius: "10px", background: "transparent", border: "1.5px solid var(--border-strong)", color: "var(--text)", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" }}>
              পরে করব
            </button>
          </div>
        </div>
      )}

      {/* BUY MODAL */}
      {showBuyModal && (
        <div onClick={() => setShowBuyModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "22px", padding: "28px", width: "100%", maxWidth: "440px", position: "relative" }}>
            <button onClick={() => setShowBuyModal(false)} style={{ position: "absolute", top: "16px", right: "16px", width: "32px", height: "32px", borderRadius: "9px", background: "var(--bg)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={17} color="var(--muted)" />
            </button>

            <h3 style={{ fontSize: "19px", fontWeight: 800, color: "var(--text)", marginBottom: "6px" }}>অর্ডার কনফার্ম করুন</h3>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "20px" }}>টাকা escrow-তে জমা হবে</p>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "14px", marginBottom: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>{listing.title}</p>
              <p style={{ fontSize: "12px", color: "var(--muted)" }}>{platformLabels[listing.platform]} · {listing.followers?.toLocaleString()} ফলোয়ার</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: "16px" }}>
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>মোট</span>
              <span style={{ fontSize: "22px", fontWeight: 800, color: "#6C63FF" }}>৳{listing.price?.toLocaleString()}</span>
            </div>

            <div style={{ padding: "11px 13px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px", marginBottom: "18px", display: "flex", alignItems: "flex-start", gap: "9px" }}>
              <Shield size={15} color="#10b981" style={{ flexShrink: 0, marginTop: "1px" }} />
              <p style={{ fontSize: "11.5px", color: "var(--text)", lineHeight: 1.6 }}>
                টাকা escrow-তে থাকবে। অ্যাকাউন্ট বুঝে নিয়ে কনফার্ম করলে বিক্রেতা টাকা পাবে।
              </p>
            </div>

            <button onClick={handleBuy} disabled={buying} className="btn-primary" style={{ width: "100%", padding: "13px", fontSize: "14px", fontWeight: 700, opacity: buying ? 0.7 : 1 }}>
              {buying ? "প্রসেস হচ্ছে..." : `৳${listing.price?.toLocaleString()} পেমেন্ট করুন`}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .details-grid { grid-template-columns: 1fr !important; }
          .details-sidebar { position: static !important; }
        }
      `}</style>
    </main>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div style={{ padding: "12px", background: "var(--bg)", borderRadius: "11px", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
        <Icon size={13} color={color} />
        <span style={{ fontSize: "11.5px", color: "var(--muted)", fontWeight: 500 }}>{label}</span>
      </div>
      <p style={{ fontSize: "14.5px", fontWeight: 800, color: "var(--text)" }}>{value}</p>
    </div>
  );
}
