"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { uploadListingImage } from "@/lib/supabase/storage";
import {
  Video, Users, Music, Check, DollarSign, Link2, AlertCircle, CheckCircle2,
  Shield, KeyRound, ImagePlus, X
} from "lucide-react";

const platforms = [
  { id: "youtube", name: "YouTube", icon: Video, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  { id: "facebook", name: "Facebook", icon: Users, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  { id: "tiktok", name: "TikTok", icon: Music, color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
];

const handoverMethods = [
  { id: "backup_code", title: "2FA Backup Code", desc: "১০টি backup code সাইটে জমা দেবেন" },
  { id: "live_relay", title: "Live Code Relay", desc: "লগইনের সময় কোড ধরিয়ে দেবেন" },
  { id: "2fa_off", title: "2FA বন্ধ করব", desc: "হ্যান্ডওভারের আগে 2FA বন্ধ করবেন" },
];

export default function CreateListingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    platform: "",
    accountLink: "",
    title: "",
    followers: "",
    country: "বাংলাদেশ",
    monetized: false,
    price: "",
    description: "",
    handover: "",
    images: [] as string[],
  });

  const update = (k: string, v: any) => setForm({ ...form, [k]: v });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("লগইন করুন");
      setUploadingImage(false);
      return;
    }

    const newImages: string[] = [];
    for (let i = 0; i < Math.min(files.length, 5); i++) {
      const url = await uploadListingImage(files[i], user.id);
      if (url) newImages.push(url);
    }
    setForm({ ...form, images: [...form.images, ...newImages] });
    setUploadingImage(false);
  };

  const removeImage = (idx: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  const isComplete =
    form.platform && form.accountLink && form.title && form.followers &&
    form.price && form.handover;

  const handleSubmit = async () => {
    setError("");
    if (!isComplete) {
      setError("সব প্রয়োজনীয় ঘর পূরণ করুন");
      return;
    }
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("লগইন করুন");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("listings").insert({
      seller_id: user.id,
      platform: form.platform,
      account_link: form.accountLink,
      title: form.title,
      description: form.description,
      followers: parseInt(form.followers) || 0,
      monetized: form.monetized,
      country: form.country,
      price: parseFloat(form.price),
      handover_method: form.handover,
      status: "pending",
      images: form.images,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
        <Header />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 20px 40px" }}>
          <div style={{ maxWidth: "480px", width: "100%", background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "22px", padding: "40px 32px", textAlign: "center" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
              <CheckCircle2 size={42} color="#10b981" />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text)", marginBottom: "8px" }}>
              লিস্টিং জমা হয়েছে!
            </h2>
            <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.7, marginBottom: "26px" }}>
              অ্যাডমিন রিভিউয়ের পর সাইটে প্রকাশিত হবে।
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/dashboard" style={{ padding: "12px 22px", borderRadius: "11px", background: "linear-gradient(135deg, #6C63FF, #5A52D5)", color: "white", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
                ড্যাশবোর্ডে যান
              </Link>
              <Link href="/browse" style={{ padding: "12px 22px", borderRadius: "11px", border: "1.5px solid var(--border-strong)", color: "var(--text)", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
                ব্রাউজ করুন
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />

      <div style={{ flex: 1, maxWidth: "820px", margin: "0 auto", padding: "90px 16px 40px", width: "100%" }}>

        <div style={{ marginBottom: "22px" }}>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800, color: "var(--text)", marginBottom: "4px", letterSpacing: "-0.02em" }}>
            নতুন লিস্টিং তৈরি করুন
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>
            নিচের সব ঘর পূরণ করে সাবমিট করুন
          </p>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "12px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "11px", fontSize: "13px", color: "#ef4444", marginBottom: "16px" }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Section 1 */}
        <section style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "18px", padding: "24px", marginBottom: "16px" }}>
          <SectionHeader num="১" title="প্ল্যাটফর্ম ও লিংক" subtitle="কোন প্ল্যাটফর্মের অ্যাকাউন্ট?" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px", marginBottom: "20px" }}>
            {platforms.map((p) => {
              const Icon = p.icon;
              const active = form.platform === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => update("platform", p.id)}
                  style={{
                    padding: "16px 10px", borderRadius: "12px",
                    background: active ? p.bg : "var(--bg)",
                    border: active ? `2px solid ${p.color}` : "1.5px solid var(--border-strong)",
                    cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                  }}
                >
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: active ? "white" : p.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} color={p.color} />
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: active ? p.color : "var(--text)" }}>{p.name}</span>
                </button>
              );
            })}
          </div>

          <label style={labelStyle}>অ্যাকাউন্টের লিংক</label>
          <div className="search-box" style={inputWrap}>
            <Link2 size={15} color="var(--muted)" />
            <input type="url" placeholder="https://youtube.com/@yourchannel" value={form.accountLink} onChange={(e) => update("accountLink", e.target.value)} style={inputStyle} />
          </div>
        </section>

        {/* Section 2 */}
        <section style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "18px", padding: "24px", marginBottom: "16px" }}>
          <SectionHeader num="২" title="অ্যাকাউন্টের তথ্য" subtitle="ক্রেতারা যেন সহজে বুঝতে পারে" />

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>শিরোনাম</label>
            <input type="text" placeholder="যেমন: ১০ হাজার সাবস্ক্রাইবার গেমিং চ্যানেল" value={form.title} onChange={(e) => update("title", e.target.value)} style={standaloneInput} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "14px" }}>
            <div>
              <label style={labelStyle}>ফলোয়ার</label>
              <div className="search-box" style={inputWrap}>
                <Users size={15} color="var(--muted)" />
                <input type="number" placeholder="10000" value={form.followers} onChange={(e) => update("followers", e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>দাম (৳)</label>
              <div className="search-box" style={inputWrap}>
                <DollarSign size={15} color="var(--muted)" />
                <input type="number" placeholder="5000" value={form.price} onChange={(e) => update("price", e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>দেশ</label>
            <select value={form.country} onChange={(e) => update("country", e.target.value)} style={standaloneInput}>
              <option>বাংলাদেশ</option>
              <option>ভারত</option>
              <option>পাকিস্তান</option>
              <option>অন্যান্য</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: "var(--bg)", border: "1.5px solid var(--border-strong)", borderRadius: "10px", marginBottom: "14px" }}>
            <input type="checkbox" id="monetized" checked={form.monetized} onChange={(e) => update("monetized", e.target.checked)} style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#6C63FF" }} />
            <label htmlFor="monetized" style={{ fontSize: "13.5px", color: "var(--text)", cursor: "pointer", fontWeight: 500 }}>মনিটাইজড (আয় চালু আছে)</label>
          </div>

          <div>
            <label style={labelStyle}>বিবরণ</label>
            <textarea rows={3} placeholder="অ্যাকাউন্ট সম্পর্কে বিস্তারিত..." value={form.description} onChange={(e) => update("description", e.target.value)} style={{ ...standaloneInput, resize: "vertical" }} />
          </div>
        </section>

        {/* Section 3 — Images */}
        <section style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "18px", padding: "24px", marginBottom: "16px" }}>
          <SectionHeader num="৩" title="স্ক্রিনশট" subtitle="অ্যাকাউন্টের প্রমাণ (সর্বোচ্চ ৫টি)" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px", marginBottom: "12px" }}>
            {form.images.map((img, i) => (
              <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border)" }}>
                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={() => removeImage(i)} style={{ position: "absolute", top: "4px", right: "4px", width: "22px", height: "22px", borderRadius: "50%", background: "rgba(239,68,68,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={12} color="white" />
                </button>
              </div>
            ))}

            {form.images.length < 5 && (
              <label style={{ aspectRatio: "1", borderRadius: "10px", border: "2px dashed var(--border-strong)", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: "6px" }}>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: "none" }} />
                {uploadingImage ? (
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>আপলোড...</span>
                ) : (
                  <>
                    <ImagePlus size={20} color="var(--muted)" />
                    <span style={{ fontSize: "11px", color: "var(--muted)" }}>যোগ করুন</span>
                  </>
                )}
              </label>
            )}
          </div>
        </section>

        {/* Section 4 */}
        <section style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "18px", padding: "24px", marginBottom: "16px" }}>
          <SectionHeader num="৪" title="হ্যান্ডওভার মেথড" subtitle="অ্যাকাউন্ট কীভাবে দেবেন? (বাধ্যতামূলক)" />

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {handoverMethods.map((m) => {
              const active = form.handover === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => update("handover", m.id)}
                  style={{
                    padding: "14px", borderRadius: "12px",
                    background: active ? "rgba(108,99,255,0.08)" : "var(--bg)",
                    border: active ? "2px solid var(--primary)" : "1.5px solid var(--border-strong)",
                    cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "12px",
                  }}
                >
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: active ? "rgba(108,99,255,0.15)" : "var(--card)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <KeyRound size={17} color={active ? "#6C63FF" : "var(--muted)"} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "13.5px", fontWeight: 700, color: active ? "var(--primary)" : "var(--text)", marginBottom: "2px" }}>{m.title}</p>
                    <p style={{ fontSize: "11.5px", color: "var(--muted)" }}>{m.desc}</p>
                  </div>
                  {active && <CheckCircle2 size={18} color="#6C63FF" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isComplete || loading}
          className="btn-primary"
          style={{ width: "100%", padding: "14px", fontSize: "14.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: (isComplete && !loading) ? 1 : 0.5, cursor: (isComplete && !loading) ? "pointer" : "not-allowed" }}
        >
          {loading ? "সাবমিট হচ্ছে..." : <><Check size={17} /> লিস্টিং সাবমিট করুন</>}
        </button>

        {!isComplete && (
          <p style={{ fontSize: "11.5px", color: "var(--muted)", textAlign: "center", marginTop: "10px" }}>
            সব প্রয়োজনীয় ঘর পূরণ করুন
          </p>
        )}
      </div>

      <Footer />
    </main>
  );
}

function SectionHeader({ num, title, subtitle }: { num: string; title: string; subtitle: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "18px" }}>
      <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg, #6C63FF 0%, #d946ef 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "14px", fontWeight: 800, flexShrink: 0 }}>
        {num}
      </div>
      <div>
        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text)", marginBottom: "2px" }}>{title}</h2>
        <p style={{ fontSize: "12.5px", color: "var(--muted)" }}>{subtitle}</p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "7px" };
const inputWrap: React.CSSProperties = { display: "flex", alignItems: "center", gap: "9px", padding: "10px 13px", border: "1.5px solid var(--border-strong)" };
const inputStyle: React.CSSProperties = { flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "13.5px", color: "var(--text)", minWidth: 0 };
const standaloneInput: React.CSSProperties = { width: "100%", padding: "11px 14px", background: "var(--bg)", border: "1.5px solid var(--border-strong)", borderRadius: "10px", fontSize: "13.5px", color: "var(--text)", outline: "none" };
