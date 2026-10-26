"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, RefreshCw, Sparkles, ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function VerifyEmailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const supabase = createClient();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[i] = val.slice(-1);
    setCode(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste) {
      const next = paste.split("");
      while (next.length < 6) next.push("");
      setCode(next);
      inputRefs.current[Math.min(paste.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const token = code.join("");
    if (token.length !== 6) {
      setError("৬ সংখ্যার কোড দিন");
      return;
    }

    setLoading(true);
    const { error: verifyErr } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: "signup",
    });
    setLoading(false);

    if (verifyErr) {
      setError(verifyErr.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/"), 1500);
  };

  const handleResend = async () => {
    if (!canResend) return;
    setTimer(60);
    setCanResend(false);
    setError("");

    const { error: resendErr } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });

    if (resendErr) setError(resendErr.message);
    else alert("নতুন কোড পাঠানো হয়েছে — ইমেইল চেক করুন");
  };

  if (success) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <CheckCircle2 size={36} color="#10b981" />
        </div>
        <h2 style={{ fontSize: "21px", fontWeight: 800, color: "var(--text)", marginBottom: "8px", letterSpacing: "-0.02em" }}>
          সফলভাবে ভেরিফাই হয়েছে!
        </h2>
        <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>
          হোমে নিয়ে যাচ্ছি...
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "22px" }}>
        <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "linear-gradient(135deg, #6C63FF 0%, #d946ef 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 10px 24px rgba(108,99,255,0.35)" }}>
          <Mail size={28} color="#fff" />
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", marginBottom: "5px", letterSpacing: "-0.02em" }}>
          ইমেইল ভেরিফাই করুন
        </h1>
        <p style={{ fontSize: "13.5px", color: "var(--muted)", marginBottom: "4px" }}>
          আমরা একটি ৬-সংখ্যার কোড পাঠিয়েছি
        </p>
        <p style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--primary)", wordBreak: "break-all" }}>
          {email}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", fontSize: "13px", color: "#ef4444", marginBottom: "12px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px", marginBottom: "20px" }} onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: "100%",
                height: "52px",
                textAlign: "center",
                fontSize: "20px",
                fontWeight: 800,
                color: "var(--text)",
                background: "var(--bg)",
                border: digit ? "2px solid var(--primary)" : "1.5px solid var(--border-strong)",
                borderRadius: "10px",
                outline: "none",
              }}
            />
          ))}
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "11px", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", opacity: loading ? 0.7 : 1, marginBottom: "16px" }}>
          {loading ? "যাচাই হচ্ছে..." : "কোড যাচাই করুন"}
        </button>
      </form>

      <div style={{ textAlign: "center", fontSize: "13.5px", color: "var(--muted)", marginBottom: "14px" }}>
        কোড পাননি?{" "}
        {canResend ? (
          <button onClick={handleResend} style={{ background: "transparent", border: "none", fontSize: "13.5px", fontWeight: 700, color: "var(--primary)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <RefreshCw size={13} /> আবার পাঠান
          </button>
        ) : (
          <span style={{ color: "var(--muted)" }}>আবার পাঠান ({timer}s)</span>
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "13px", fontWeight: 600, color: "var(--muted)", textDecoration: "none" }}>
          <ArrowLeft size={14} /> লগইনে ফিরে যান
        </Link>
      </div>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", padding: "20px 20px 40px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "5%", left: "5%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "5%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(217,70,239,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "460px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", textDecoration: "none", marginBottom: "20px" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(139,92,246,0.4)" }}>
            <Sparkles size={22} color="#fff" />
          </div>
          <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
            Social<span style={{ color: "#6C63FF" }}>Market</span>
          </span>
        </Link>

        <div style={{ background: "var(--card)", border: "1.5px solid var(--border-strong)", borderRadius: "20px", padding: "28px 26px", boxShadow: "0 20px 60px -20px rgba(108,99,255,0.25)" }} className="auth-card">
          <Suspense fallback={<div style={{ color: "var(--muted)", textAlign: "center" }}>লোড হচ্ছে...</div>}>
            <VerifyEmailContent />
          </Suspense>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "18px", fontSize: "12px", color: "var(--muted)", justifyContent: "center", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><ShieldCheck size={13} color="#10b981" /> এসক্রো সুরক্ষিত</span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Zap size={13} color="#f59e0b" /> দ্রুত পেমেন্ট</span>
        </div>
      </div>
    </main>
  );
}
