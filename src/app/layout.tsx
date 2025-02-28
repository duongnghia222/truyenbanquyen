import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LayoutContent from "./LayoutContent";
import { initDatabase } from "@/lib/db";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TruyenBanQuyen - Đọc Truyện Online",
  description: "Đọc truyện online, truyện hay, truyện chữ.",
};

// Initialize database connection
initDatabase().catch(console.error);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyClasses = [
    geistSans.variable,
    geistMono.variable,
    'antialiased'
  ].join(' ');

  return (
    <html lang="vi">
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
      <body className={bodyClasses}>
        <LayoutContent>
          {children}
        </LayoutContent>
      </body>
    </html>
  );
}
