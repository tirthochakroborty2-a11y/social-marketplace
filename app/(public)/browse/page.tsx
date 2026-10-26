"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import {
  Search, X, SlidersHorizontal, Users, ArrowRight,
  Video, Music, CheckCircle2, Grid3x3, LayoutList, Loader2
} from "lucide-react";

type Listing = {
  id: string;
  title: string;
  platform: string;
  price: number;
  followers: number;
  monetized: boolean;
  country: string;
};

const platformColors: Record<string, { color: string; bg: string; icon: any }> = {
  youtube: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: Video },
  facebook: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: Users },
  tiktok: { color: "#a855f7", bg: "rgba(168,85,247,0.1)", icon: Music },
};

const platformLabels: Record<string, string> = {
  youtube: "ইউটিউব",
  facebook: "ফেসবুক",
  tiktok: "টিকটক",
};

export default function BrowsePage() {
  const supabase = createClient();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [monetized, setMonetized] = useState(false);
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, platform, price, followers, monetized, country")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setListings(data || []);
    setLoading(false);
  };

  let filtered = listings.filter((l) => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = platform === "all" || l.platform === platform;
    const matchMonetized = !monetized || l.monetized;
    let matchPrice = true;
    if (priceRange === "low") matchPrice = l.price < 5000;
    else if (priceRange === "mid") matchPrice = l.price >= 5000 && l.price <= 15000;
    else if (priceRange === "high") matchPrice = l.price > 15000;
    return matchSearch && matchPlatform && matchMonetized && matchPrice;
  });

  if (sortBy === "price-low") filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === "price-high") filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === "followers") filtered.sort((a, b) => b.followers - a.followers);

  const resetFilters = () => {
    setSearch("");
    setPlatform("all");
    setMonetized(false);
    setPriceRange("all");
  };

  const activeFilters = (platform !== "all" ? 1 : 0) + (monetized ? 1 : 0) + (priceRange !== "all" ? 1 : 0);

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />

      <div style={{ flex: 1, maxWidth: "1300px", margin: "0 auto", padding: "96px 20px 40px", width: "100%" }}>

        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800, color: "var(--text)", marginBottom: "4px", letterSpacing: "-0.02em" }}>
            সব লিস্টিং ব্রাউজ করুন
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>
            {filtered.length}টি অ্যাকাউন্ট পাওয়া গেছে
          </p>
        </div>

        <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px", padding: "14px", marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <div className="search-box" style={{ display: "flex", alignItems: "center", gap: "9px", padding: "10px 13px", flex: 1, minWidth: "220px", border: "1.5px solid var(--border-strong)" }}>
              <Search size={16} color="var(--muted)" />
              <input type="text" placeholder="সার্চ করুন..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "13.5px", color: "var(--text)", minWidth: 0 }} />
              {search && (
                <button onClick={() => setSearch("")} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                  <X size={14} color="var(--muted)" />
                </button>
              )}
            </div>

            <button onClick={() => setShowFilters(!showFilters)} style={{ padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--border-strong)", background: "var(--bg)", color: "var(--text)", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", position: "relative" }}>
              <SlidersHorizontal size={15} /> ফিল্টার
              {activeFilters > 0 && (
                <span style={{ position: "absolute", top: "-6px", right: "-6px", width: "18px", height: "18px", borderRadius: "50%", background: "#6C63FF", color: "white", fontSize: "10px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {activeFilters}
                </span>
              )}
            </button>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "10px 13px", borderRadius: "10px", border: "1.5px solid var(--border-strong)", background: "var(--bg)", color: "var(--text)", fontSize: "13px", fontWeight: 600, cursor: "pointer", outline: "none" }}>
              <option value="newest">নতুন আগে</option>
              <option value="price-low">দাম: কম → বেশি</option>
              <option value="price-high">দাম: বেশি → কম</option>
              <option value="followers">ফলোয়ার: বেশি আগে</option>
            </select>

            <div style={{ display: "flex", gap: "4px", background: "var(--bg)", borderRadius: "10px", padding: "4px", border: "1.5px solid var(--border-strong)" }}>
              <button onClick={() => setViewMode("grid")} style={{ padding: "6px 8px", borderRadius: "7px", background: viewMode === "grid" ? "var(--card)" : "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <Grid3x3 size={15} color={viewMode === "grid" ? "var(--primary)" : "var(--muted)"} />
              </button>
              <button onClick={() => setViewMode("list")} style={{ padding: "6px 8px", borderRadius: "7px", background: viewMode === "list" ? "var(--card)" : "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <LayoutList size={15} color={viewMode === "list" ? "var(--primary)" : "var(--muted)"} />
              </button>
            </div>
          </div>

          {showFilters && (
            <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1.5px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>ফিল্টার</span>
                <button onClick={resetFilters} style={{ background: "transparent", border: "none", color: "var(--primary)", fontSize: "12.5px", fontWeight: 600, cursor: "pointer" }}>রিসেট</button>
              </div>

              <p style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, marginBottom: "8px" }}>প্ল্যাটফর্ম</p>
              <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", marginBottom: "14px" }}>
                {[
                  { key: "all", label: "সব" },
                  { key: "youtube", label: "ইউটিউব" },
                  { key: "facebook", label: "ফেসবুক" },
                  { key: "tiktok", label: "টিকটক" },
                ].map((p) => (
                  <button key={p.key} onClick={() => setPlatform(p.key)} style={{ padding: "7px 14px", borderRadius: "9px", fontSize: "12.5px", fontWeight: 600, background: platform === p.key ? "rgba(108,99,255,0.1)" : "var(--bg)", color: platform === p.key ? "var(--primary)" : "var(--text)", border: platform === p.key ? "1.5px solid var(--primary)" : "1.5px solid var(--border-strong)", cursor: "pointer" }}>
                    {p.label}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, marginBottom: "8px" }}>দামের পরিসর</p>
              <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", marginBottom: "14px" }}>
                {[
                  { key: "all", label: "সব" },
                  { key: "low", label: "৳৫,০০০ এর কম" },
                  { key: "mid", label: "৳৫,০০০ – ১৫,০০০" },
                  { key: "high", label: "৳১৫,০০০+" },
                ].map((p) => (
                  <button key={p.key} onClick={() => setPriceRange(p.key)} style={{ padding: "7px 14px", borderRadius: "9px", fontSize: "12.5px", fontWeight: 600, background: priceRange === p.key ? "rgba(108,99,255,0.1)" : "var(--bg)", color: priceRange === p.key ? "var(--primary)" : "var(--text)", border: priceRange === p.key ? "1.5px solid var(--primary)" : "1.5px solid var(--border-strong)", cursor: "pointer" }}>
                    {p.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 13px", background: "var(--bg)", border: "1.5px solid var(--border-strong)", borderRadius: "10px" }}>
                <input type="checkbox" id="monetized-filter" checked={monetized} onChange={(e) => setMonetized(e.target.checked)} style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#6C63FF" }} />
                <label htmlFor="monetized-filter" style={{ fontSize: "13px", color: "var(--text)", fontWeight: 500, cursor: "pointer" }}>শুধু মনিটাইজড</label>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Loader2 size={36} color="var(--primary)" style={{ marginBottom: "14px", animation: "spin 1s linear infinite" }} />
            <p style={{ fontSize: "13px", color: "var(--muted)" }}>লোড হচ্ছে...</p>
            <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "18px" }}>
            <Search size={44} color="var(--muted)" style={{ marginBottom: "14px" }} />
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>কোনো লিস্টিং পাওয়া যায়নি</h3>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "18px" }}>
              {listings.length === 0 ? "এখনো কোনো active listing নেই।" : "ফিল্টার বদলে আবার চেষ্টা করুন"}
            </p>
            <button onClick={resetFilters} className="btn-primary" style={{ padding: "10px 20px", fontSize: "13px" }}>
              ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          <div style={viewMode === "grid" ? { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" } : { display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map((item) => {
              const pc = platformColors[item.platform] || { color: "#6C63FF", bg: "rgba(108,99,255,0.1)", icon: Video };
              const Icon = pc.icon;
              return (
                <Link
                  key={item.id}
                  href={`/listing/${item.id}`}
                  style={{
                    background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "16px",
                    padding: "18px", textDecoration: "none", position: "relative", overflow: "hidden",
                    display: viewMode === "list" ? "flex" : "block", alignItems: "center", gap: viewMode === "list" ? "16px" : 0,
                  }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: pc.color }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", marginTop: "4px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11.5px", padding: "4px 9px", borderRadius: "7px", background: pc.bg, color: pc.color, fontWeight: 700 }}>
                        <Icon size={12} /> {platformLabels[item.platform] || item.platform}
                      </span>
                    </div>

                    <h3 style={{ fontWeight: 700, fontSize: "14.5px", marginBottom: "8px", color: "var(--text)", lineHeight: 1.4 }}>{item.title}</h3>
                    <p style={{ fontSize: "12.5px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "5px", marginBottom: "14px" }}>
                      <Users size={13} /> {item.followers.toLocaleString()} ফলোয়ার
                      {item.monetized && (
                        <>
                          <span style={{ margin: "0 6px" }}>·</span>
                          <CheckCircle2 size={12} color="#10b981" /> মনিটাইজড
                        </>
                      )}
                    </p>
                  </div>

                  <div style={viewMode === "grid" ? { display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid var(--border)" } : { display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
                    <div>
                      {viewMode === "grid" && <p style={{ fontSize: "10.5px", color: "var(--muted)", marginBottom: "3px", fontWeight: 600 }}>দাম</p>}
                      <span style={{ fontSize: viewMode === "grid" ? "20px" : "17px", fontWeight: 800, color: "#6C63FF", letterSpacing: "-0.02em" }}>৳{item.price.toLocaleString()}</span>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", fontSize: "12.5px", background: "linear-gradient(135deg, #6C63FF, #5A52D5)", color: "white", borderRadius: "9px", fontWeight: 600 }}>
                      দেখুন <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
