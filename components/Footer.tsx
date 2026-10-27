"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#2D2D3F",
        color: "rgba(255,255,255,0.7)",
        padding: "60px 0 20px", // উপরে ৬০, নিচে ২০
        marginTop: "auto",
        width: "100%", // ফুটার সবসময় ফুল উইডথ থাকবে
      }}
    >
      {/* 
        এখানে কন্টেইনার ঠিক করা হয়েছে। 
        মোবাইলে padding 16px, ডেস্কটপে 32px দেওয়া হয়েছে 
      */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 16px", 
          width: "100%",
        }}
        className="footer-container" // মোবাইলের জন্য ক্লাস
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          {/* Brand */}
          <div>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 18px rgba(139, 92, 246, 0.35)",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={19} color="#fff" />
              </div>
              <span
                style={{
                  fontSize: "19px",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                }}
              >
                Social
                <span
                  style={{
                    background: "linear-gradient(135deg, #a78bfa 0%, #e879f9 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Market
                </span>
              </span>
            </Link>
            <p style={{ fontSize: "14px", lineHeight: "1.8" }}>
              নিরাপদ সোশ্যাল মিডিয়া অ্যাকাউন্ট কেনা-বেচার বিশ্বস্ত প্ল্যাটফর্ম। এস্ক্রো সুরক্ষা, দ্রুত হ্যান্ডওভার।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                color: "white",
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "16px",
                position: "relative",
                paddingBottom: "10px",
              }}
            >
              কুইক লিংক
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "40px",
                  height: "3px",
                  background: "#6C63FF",
                  borderRadius: "2px",
                }}
              />
            </h4>
            <Link href="/" style={linkStyle}>হোম</Link>
            <Link href="/browse" style={linkStyle}>ব্রাউজ</Link>
            <Link href="/about" style={linkStyle}>সম্পর্কে</Link>
          </div>

          {/* Categories */}
          <div>
            <h4
              style={{
                color: "white",
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "16px",
                position: "relative",
                paddingBottom: "10px",
              }}
            >
              ক্যাটাগরি
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "40px",
                  height: "3px",
                  background: "#6C63FF",
                  borderRadius: "2px",
                }}
              />
            </h4>
            <Link href="/browse?platform=youtube" style={linkStyle}>ইউটিউব চ্যানেল</Link>
            <Link href="/browse?platform=facebook" style={linkStyle}>ফেসবুক পেজ</Link>
            <Link href="/browse?platform=tiktok" style={linkStyle}>টিকটক আইডি</Link>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                color: "white",
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "16px",
                position: "relative",
                paddingBottom: "10px",
              }}
            >
              যোগাযোগ
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "40px",
                  height: "3px",
                  background: "#6C63FF",
                  borderRadius: "2px",
                }}
              />
            </h4>
            <p style={contactStyle}>📧 support@socialmarket.com</p>
            <p style={contactStyle}>📱 +880 1700 000000</p>
            <p style={contactStyle}>📍 ঢাকা, বাংলাদেশ</p>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "20px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          © ২০২৬ সোশ্যালমার্কেট। সব অধিকার সংরক্ষিত।
        </div>
      </div>

      {/* Responsive Fix */}
      <style jsx>{`
        @media (min-width: 768px) {
          .footer-container {
            padding: 0 32px !important; /* বড় স্ক্রিনে একটু বেশি স্পেস */
          }
        }
      `}</style>
    </footer>
  );
}

const linkStyle: React.CSSProperties = {
  display: "block",
  padding: "6px 0",
  fontSize: "14px",
  color: "rgba(255,255,255,0.7)",
  textDecoration: "none",
};

const contactStyle: React.CSSProperties = {
  padding: "6px 0",
  fontSize: "14px",
};
