"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, LogIn, Moon, Sun, Sparkles,
  Home, Compass, PlusCircle, Wallet, LayoutDashboard, User, LogOut
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("bn");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadUser();
      else { setUser(null); setProfile(null); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("name, avatar_url, role, coin_balance")
        .eq("id", user.id)
        .single();
      setProfile(data);
    }
    setLoading(false);
  };

  // Realtime: balance update
  useEffect(() => {
    if (!user?.id) return;

    const channelName = `profile-rt-${user.id}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload) => {
          setProfile((prev: any) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: "global" });
      showToast("info", "লগআউট সফল", "আপনি সফলভাবে লগআউট হয়েছেন");
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    } catch {
      window.location.href = "/login";
    }
  };

  const bgColor = darkMode ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)";
  const textColor = darkMode ? "#e5e7eb" : "#2D2D3F";
  const panelBg = darkMode ? "#1e293b" : "white";
  const borderColor = darkMode ? "#334155" : "#E5E7EB";

  const guestLinks = [
    { to: "/", label: "হোম", icon: Home },
    { to: "/browse", label: "ব্রাউজ", icon: Compass },
  ];

  const userLinks = [
    { to: "/", label: "হোম", icon: Home },
    { to: "/browse", label: "ব্রাউজ", icon: Compass },
    { to: "/create-listing", label: "বিক্রি", icon: PlusCircle },
    { to: "/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
    { to: "/wallet", label: "ওয়ালেট", icon: Wallet },
  ];

  const navLinks = user ? userLinks : guestLinks;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const displayName = profile?.name || user?.email?.split("@")[0] || "U";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          padding: "12px 0", background: bgColor, backdropFilter: "blur(20px)",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.08)" : "0 2px 30px rgba(0,0,0,0.06)",
          borderBottom: `1px solid ${borderColor}`,
          transition: "all 0.3s",
        }}
      >
        <div style={{ width: "100%", paddingLeft: "16px", paddingRight: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* LOGO */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(139, 92, 246, 0.35)" }}>
              <Sparkles size={19} color="#fff" />
            </div>
            <span style={{ fontSize: "19px", fontWeight: 800, color: textColor, letterSpacing: "-0.02em" }}>
              Social<span style={{ color: "#6C63FF" }}>Market</span>
            </span>
          </Link>

          {/* NAV */}
          <nav style={{ display: "flex", alignItems: "center", gap: "4px" }} className="desktop-nav">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  href={link.to}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    fontSize: "13.5px", fontWeight: active ? 700 : 500,
                    color: active ? "#6C63FF" : textColor,
                    padding: "8px 12px", borderRadius: "9px",
                    background: active ? "rgba(108,99,255,0.1)" : "transparent",
                    textDecoration: "none", whiteSpace: "nowrap",
                  }}
                >
                  <Icon size={15} color={active ? "#6C63FF" : textColor} />
                  {link.label}
                </Link>
              );
            })}

            <div style={{ width: "1px", height: "20px", background: borderColor, margin: "0 8px" }} />

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <IconBtn dark={darkMode} onClick={() => setLanguage(language === "bn" ? "en" : "bn")}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#6C63FF" }}>
                  {language === "bn" ? "EN" : "বাং"}
                </span>
              </IconBtn>
              <IconBtn dark={darkMode} onClick={toggleDarkMode}>
                {darkMode ? <Sun size={15} color="#FFC857" /> : <Moon size={15} color="#6C63FF" />}
              </IconBtn>

              {loading ? null : user ? (
                <>
                  <Link href="/profile" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "13px", textDecoration: "none", border: "2px solid #6C63FF" }}>
                    {initial}
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "9px 14px", borderRadius: "50px",
                      background: "rgba(239,68,68,0.1)", color: "#ef4444",
                      fontSize: "12.5px", fontWeight: 700,
                      border: "1px solid rgba(239,68,68,0.2)",
                      cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    <LogOut size={13} /> লগআউট
                  </button>
                </>
              ) : (
                <Link href="/login" style={{ padding: "9px 20px", background: "linear-gradient(135deg, #6C63FF, #5A52D5)", color: "white", borderRadius: "50px", fontSize: "13px", fontWeight: 600, boxShadow: "0 8px 20px rgba(108, 99, 255, 0.25)", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
                  <LogIn size={14} /> লগইন
                </Link>
              )}
            </div>
          </nav>

          <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger" style={{ display: "none", background: "transparent", padding: "8px", border: "none" }}>
            {menuOpen ? <X size={26} color="#6C63FF" /> : <Menu size={26} color="#6C63FF" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div style={{ position: "fixed", top: 0, right: menuOpen ? 0 : "-320px", width: "300px", height: "100vh", background: panelBg, boxShadow: "-4px 0 30px rgba(0,0,0,0.15)", padding: "80px 24px 24px", zIndex: 1001, transition: "right 0.4s cubic-bezier(0.4, 0, 0.2, 1)", overflowY: "auto" }}>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "rgba(108,99,255,0.08)", borderRadius: "12px", marginBottom: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800 }}>
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: textColor, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
              <p style={{ fontSize: "11px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                href={link.to}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "13px 0", borderBottom: `1px solid ${borderColor}`,
                  color: active ? "#6C63FF" : textColor,
                  fontWeight: 600, fontSize: "14.5px", textDecoration: "none",
                }}
              >
                <Icon size={17} color={active ? "#6C63FF" : textColor} />
                {link.label}
              </Link>
            );
          })}

          {user && (
            <Link href="/profile" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "13px 0", borderBottom: `1px solid ${borderColor}`, color: textColor, fontWeight: 600, fontSize: "14.5px", textDecoration: "none" }}>
              <User size={17} /> প্রোফাইল
            </Link>
          )}

          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <button onClick={() => setLanguage(language === "bn" ? "en" : "bn")} style={pillBtn(darkMode)}>
              🌐 {language === "bn" ? "English" : "বাংলা"}
            </button>
            <button onClick={toggleDarkMode} style={pillBtn(darkMode)}>
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>

          {user ? (
            <button onClick={handleLogout} style={{ marginTop: "16px", padding: "13px", background: "rgba(239,68,68,0.1)", color: "#ef4444", borderRadius: "11px", fontSize: "14px", fontWeight: 700, border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
              <LogOut size={16} /> লগআউট
            </button>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} style={{ marginTop: "16px", padding: "13px", background: "linear-gradient(135deg, #6C63FF, #5A52D5)", color: "white", borderRadius: "11px", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", textDecoration: "none" }}>
              <LogIn size={16} /> লগইন
            </Link>
          )}
        </div>
      </div>

      <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 1000, opacity: menuOpen ? 1 : 0, visibility: menuOpen ? "visible" : "hidden", transition: "all 0.3s" }} />

      <style jsx global>{`
        @media (max-width: 1100px) { .desktop-nav { gap: 2px !important; } }
        @media (max-width: 992px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </>
  );
}

function pillBtn(dark: boolean) {
  return {
    flex: 1, padding: "12px",
    background: dark ? "#334155" : "#F8F9FE",
    border: "none", borderRadius: "10px",
    fontSize: "13px", fontWeight: 800,
    color: "#6C63FF", cursor: "pointer",
  };
}

function IconBtn({ children, onClick, dark }: { children: React.ReactNode; onClick: () => void; dark: boolean }) {
  return (
    <button onClick={onClick} style={{ width: "34px", height: "34px", borderRadius: "50%", background: dark ? "#334155" : "#F8F9FE", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </button>
  );
}
