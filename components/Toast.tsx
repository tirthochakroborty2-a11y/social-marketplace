"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
};

let toastId = 0;
let listeners: ((toasts: Toast[]) => void)[] = [];
let toastsStore: Toast[] = [];

export function showToast(type: ToastType, title: string, message?: string) {
  const id = ++toastId;
  toastsStore = [...toastsStore, { id, type, title, message }];
  listeners.forEach((l) => l(toastsStore));

  setTimeout(() => {
    toastsStore = toastsStore.filter((t) => t.id !== id);
    listeners.forEach((l) => l(toastsStore));
  }, 4000);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setToasts([...newToasts]);
    listeners.push(listener);
    setToasts([...toastsStore]);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const removeToast = (id: number) => {
    toastsStore = toastsStore.filter((t) => t.id !== id);
    listeners.forEach((l) => l(toastsStore));
  };

  if (toasts.length === 0) return null;

  const config = {
    success: { icon: CheckCircle2, color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)" },
    error: { icon: XCircle, color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" },
    warning: { icon: AlertCircle, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
    info: { icon: Info, color: "#6C63FF", bg: "rgba(108,99,255,0.1)", border: "rgba(108,99,255,0.3)" },
  };

  return (
    <div style={{ position: "fixed", top: "90px", right: "20px", zIndex: 9999, display: "flex", flexDirection: "column", gap: "10px", maxWidth: "380px", pointerEvents: "none" }}>
      {toasts.map((toast) => {
        const c = config[toast.type];
        const Icon = c.icon;
        return (
          <div
            key={toast.id}
            style={{
              background: "var(--card)",
              border: `1.5px solid ${c.border}`,
              borderLeft: `4px solid ${c.color}`,
              borderRadius: "14px",
              padding: "14px 16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
              animation: "slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              pointerEvents: "auto",
            }}
          >
            <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={17} color={c.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text)", marginBottom: toast.message ? "3px" : 0 }}>
                {toast.title}
              </p>
              {toast.message && (
                <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.5 }}>
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: "2px", display: "flex", flexShrink: 0, opacity: 0.5 }}
            >
              <X size={14} color="var(--muted)" />
            </button>
          </div>
        );
      })}
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
