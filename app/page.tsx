import Link from "next/link";
import {
  Search, Plus, TrendingUp, Shield, Zap, ArrowRight, Star,
  CheckCircle2, Wallet, CreditCard, Smartphone, BadgeCheck,
  MessageCircle, Users
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const demoListings = [
  { id: 1, title: "১০ হাজার সাবস্ক্রাইবার গেমিং চ্যানেল", platform: "ইউটিউব", price: 5000, followers: "১০,০০০", monetized: true, badge: "🔥 হট", badgeColor: "#ef4444" },
  { id: 2, title: "৫০ হাজার ফলোয়ার ফুড পেজ", platform: "ফেসবুক", price: 12000, followers: "৫০,০০০", monetized: true, badge: "⚡ ট্রেন্ডিং", badgeColor: "#f59e0b" },
  { id: 3, title: "২৫ হাজার টিকটক অ্যাকাউন্ট", platform: "টিকটক", price: 3500, followers: "২৫,০০০", monetized: false, badge: "✨ নতুন", badgeColor: "#8b5cf6" },
  { id: 4, title: "৫ হাজার টেক রিভিউ চ্যানেল", platform: "ইউটিউব", price: 2200, followers: "৫,০০০", monetized: false, badge: "💎 সেরা", badgeColor: "#06b6d4" },
];

const features = [
  { icon: Shield, title: "এসক্রো সুরক্ষা", desc: "টাকা নিরাপদে আটকে থাকে যতক্ষণ না আপনি কনফার্ম করছেন", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
  { icon: Zap, title: "দ্রুত হ্যান্ডওভার", desc: "৭২ ঘণ্টার মধ্যে সম্পূর্ণ ট্রান্সফার প্রক্রিয়া", gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" },
  { icon: TrendingUp, title: "সেরা দাম", desc: "হাজারো ভেরিফায়েড সেলারের সাথে ন্যায্য মূল্যে কেনা-বেচা", gradient: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)" },
  { icon: MessageCircle, title: "২৪/৭ সাপোর্ট", desc: "যেকোনো সমস্যায় আমাদের টিম সবসময় পাশে", gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" },
];

const payments = [
  { name: "bKash", color: "#E2136E", bg: "#FCE7F3", icon: Smartphone },
  { name: "Nagad", color: "#F58220", bg: "#FEF3E2", icon: Smartphone },
  { name: "Rocket", color: "#8B2E8E", bg: "#F3E8F5", icon: Wallet },
  { name: "Card", color: "#3b82f6", bg: "#EFF6FF", icon: CreditCard },
];

const platformColors: Record<string, { color: string; bg: string }> = {
  "ইউটিউব": { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  "ফেসবুক": { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  "টিকটক": { color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
};

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", transition: "background 0.3s" }}>
      <Header />

      <div style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", padding: "96px 20px 32px", width: "100%" }}>

        {/* ===== HERO ===== */}
        <section style={{ textAlign: "center", padding: "20px 24px 56px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "999px", background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)", fontSize: "13px", fontWeight: 500, color: "var(--primary)", marginBottom: "28px" }}>
            <Star size={13} color="#f59e0b" fill="#f59e0b" />
            ১০,০০০+ ব্যবহারকারীর বিশ্বস্ত · এসক্রো সুরক্ষিত
          </div>

          <h1 style={{ fontSize: "clamp(32px, 6vw, 58px)", fontWeight: 800, color: "var(--text)", marginBottom: "20px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            সোশ্যাল অ্যাকাউন্ট <br />
            <span style={{ background: "linear-gradient(135deg, #6C63FF, #d946ef)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              কিনুন ও বিক্রি করুন
            </span>
          </h1>

          <p style={{ color: "var(--muted)", fontSize: "16px", marginBottom: "32px", maxWidth: "560px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>
            ইউটিউব, ফেসবুক, টিকটক — সবকিছু এক জায়গায়। ১০০% নিরাপদ লেনদেন, দ্রুত হ্যান্ডওভার।
          </p>

          <div style={{ maxWidth: "600px", margin: "0 auto 24px" }}>
            <div className="search-box" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 12px 12px 20px" }}>
              <Search size={19} color="var(--muted)" />
              <input type="text" placeholder="ইউটিউব চ্যানেল, ফেসবুক পেজ খুঁজুন..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "15px", color: "var(--text)" }} />
              <button className="btn-primary" style={{ padding: "10px 20px", fontSize: "14px" }}>সার্চ</button>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px", fontSize: "13px", color: "var(--muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><CheckCircle2 size={14} color="#10b981" /> লুকানো ফি নেই</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><CheckCircle2 size={14} color="#10b981" /> ভেরিফায়েড সেলার</span>
          </div>
        </section>

        {/* ===== LIVE LISTINGS ===== */}
        <section className="section-box">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h2 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 800, color: "var(--text)", marginBottom: "8px", letterSpacing: "-0.02em" }}>
                লাইভ <span style={{ background: "linear-gradient(135deg, #6C63FF, #d946ef)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>লিস্টিং</span>
              </h2>
              <p style={{ fontSize: "14px", color: "var(--muted)" }}>ইউটিউব, ফেসবুক ও টিকটকের সেরা অ্যাকাউন্টগুলো</p>
            </div>
            <Link href="/browse" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "10px", background: "rgba(108,99,255,0.1)", color: "var(--primary)", fontSize: "14px", fontWeight: 600, textDecoration: "none", border: "1px solid rgba(108,99,255,0.2)" }}>
              সবকিছু দেখুন <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {demoListings.map((item) => {
              const pc = platformColors[item.platform] || { color: "#6C63FF", bg: "rgba(108,99,255,0.1)" };
              return (
                <Link key={item.id} href={`/listing/${item.id}`} style={{ textDecoration: "none" }}>
                  <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", height: "100%" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: pc.color }} />

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", marginTop: "4px" }}>
                      <span style={{ fontSize: "12px", padding: "5px 12px", borderRadius: "8px", background: pc.bg, color: pc.color, fontWeight: 700 }}>
                        {item.platform}
                      </span>
                      {item.badge && (
                        <span style={{ fontSize: "11px", padding: "5px 10px", borderRadius: "8px", background: item.badgeColor, color: "white", fontWeight: 700 }}>
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "10px", color: "var(--text)", lineHeight: 1.4 }}>{item.title}</h3>
                    <p style={{ fontSize: "13.5px", color: "var(--muted)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Users size={14} /> {item.followers} ফলোয়ার
                    </p>

                    {item.monetized && (
                      <div style={{ marginBottom: "16px", fontSize: "11px", padding: "4px 10px", borderRadius: "6px", background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px", width: "fit-content" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
                        মনিটাইজড
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid var(--border)", marginTop: "auto" }}>
                      <div>
                        <p style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600, letterSpacing: "0.05em" }}>দাম</p>
                        <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.02em" }}>৳{item.price}</span>
                      </div>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", fontSize: "13px", background: "linear-gradient(135deg, #6C63FF, #5A52D5)", color: "white", borderRadius: "10px", fontWeight: 600 }}>
                        দেখুন <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ===== SELL CTA ===== */}
        <section className="section-box" style={{ padding: 0, overflow: "hidden", background: "linear-gradient(135deg, #6C63FF 0%, #9333ea 50%, #d946ef 100%)", border: "none" }}>
          <Link href="/create-listing" style={{ display: "block", textDecoration: "none" }}>
            <div style={{ padding: "64px 40px", color: "white", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(40px)" }} />
              <div style={{ position: "absolute", bottom: "-40px", left: "-40px", width: "200px", height: "200px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(40px)" }} />
              <div style={{ position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.15)", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
                  <Zap size={14} /> দ্রুত পেমেন্ট
                </div>
                <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: "14px" }}>
                  আপনার অ্যাকাউন্ট বিক্রি করুন
                </h2>
                <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: "32px", maxWidth: "480px", marginLeft: "auto", marginRight: "auto", fontSize: "15px", lineHeight: 1.7 }}>
                  আপনার ইউটিউব, ফেসবুক বা টিকটক অ্যাকাউন্টকে টাকায় পরিণত করুন। এসক্রো সুরক্ষিত, ৭২ ঘণ্টায় পেমেন্ট।
                </p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px", borderRadius: "12px", background: "white", color: "#6C63FF", fontWeight: 700, fontSize: "15px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
                  <Plus size={18} /> বিক্রি শুরু করুন
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* ===== ABOUT ===== */}
        <section className="section-box">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "48px", alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "999px", background: "rgba(108,99,255,0.1)", fontSize: "13px", fontWeight: 600, color: "var(--primary)", marginBottom: "20px" }}>
                <BadgeCheck size={14} /> আমাদের সম্পর্কে
              </div>
              <h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: "var(--text)", marginBottom: "16px", lineHeight: 1.3, letterSpacing: "-0.02em" }}>
                বাংলাদেশের সবচেয়ে <span style={{ background: "linear-gradient(135deg, #6C63FF, #d946ef)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>বিশ্বস্ত</span> মার্কেটপ্লেস
              </h2>
              <p style={{ fontSize: "14.5px", color: "var(--muted)", lineHeight: 1.8, marginBottom: "16px" }}>
                আমরা একটি নিরাপদ প্ল্যাটফর্ম যেখানে আপনি সহজেই সোশ্যাল মিডিয়া অ্যাকাউন্ট কিনতে ও বিক্রি করতে পারবেন। এস্ক্রো সিস্টেমের মাধ্যমে প্রতিটি লেনদেন সুরক্ষিত থাকে।
              </p>
              <p style={{ fontSize: "14.5px", color: "var(--muted)", lineHeight: 1.8, marginBottom: "28px" }}>
                হাজারো সন্তুষ্ট ব্যবহারকারী আমাদের উপর ভরসা করেন। আপনার প্রতিটি লেনদেন আমাদের দায়িত্ব।
              </p>
              <Link href="/about" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #6C63FF, #5A52D5)", color: "white", fontSize: "14px", fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 20px rgba(108,99,255,0.3)" }}>
                আমাদের সম্পর্কে দেখুন <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { num: "১০,০০০+", label: "সন্তুষ্ট ব্যবহারকারী", color: "#6C63FF" },
                { num: "২৫,০০০+", label: "সফল লেনদেন", color: "#10b981" },
                { num: "৯৯.৯%", label: "সফলতার হার", color: "#f59e0b" },
                { num: "২৪/৭", label: "সাপোর্ট", color: "#d946ef" },
              ].map((s) => (
                <div key={s.label} style={{ padding: "28px 20px", textAlign: "center", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "16px" }}>
                  <div style={{ fontSize: "26px", fontWeight: 800, color: s.color, marginBottom: "6px", letterSpacing: "-0.02em" }}>{s.num}</div>
                  <div style={{ fontSize: "13px", color: "var(--muted)", fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section className="section-box">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: "var(--text)", marginBottom: "10px", letterSpacing: "-0.02em" }}>
              কেন <span style={{ background: "linear-gradient(135deg, #6C63FF, #d946ef)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>সোশ্যালমার্কেট?</span>
            </h2>
            <p style={{ fontSize: "14.5px", color: "var(--muted)" }}>নিরাপত্তা, গতি আর বিশ্বাসের সেরা সমন্বয়</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card" style={{ padding: "28px 24px", background: "var(--card)", border: "1px solid var(--border)" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px", background: f.gradient, boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}>
                    <Icon size={22} color="#fff" />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "8px", color: "var(--text)" }}>{f.title}</h3>
                  <p style={{ fontSize: "13.5px", color: "var(--muted)", lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== PAYMENT ===== */}
        <section className="section-box" style={{ marginBottom: "40px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: "var(--text)", marginBottom: "10px", letterSpacing: "-0.02em" }}>
              পেমেন্ট <span style={{ background: "linear-gradient(135deg, #6C63FF, #d946ef)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>মেথড</span>
            </h2>
            <p style={{ fontSize: "14.5px", color: "var(--muted)" }}>আপনার পছন্দের মাধ্যমে নিরাপদে পেমেন্ট করুন</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", maxWidth: "900px", margin: "0 auto" }}>
            {payments.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.name} className="card" style={{ padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center", background: "var(--card)", border: "1px solid var(--border)" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: p.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={26} color={p.color} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>{p.name}</span>
                  <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle2 size={12} /> সাপোর্টেড
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "40px", textAlign: "center", padding: "20px", background: "rgba(108,99,255,0.08)", borderRadius: "16px", maxWidth: "700px", marginLeft: "auto", marginRight: "auto", border: "1px solid rgba(108,99,255,0.2)" }}>
            <p style={{ fontSize: "14px", color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <Shield size={16} /> সব লেনদেন ১০০% এসক্রো সুরক্ষিত
            </p>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  );
}
