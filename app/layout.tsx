import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/Toast";

export const metadata: Metadata = {
  title: "SocialMarket - Buy & Sell Social Accounts",
  description: "Buy and sell YouTube channels, Facebook pages, TikTok accounts safely.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" data-scroll-behavior="smooth">
      <body style={{ paddingTop: "80px" }}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
