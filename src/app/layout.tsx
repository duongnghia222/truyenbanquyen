import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LayoutContent from "./LayoutContent";
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
      <body className={bodyClasses}>
        <LayoutContent>
          {children}
        </LayoutContent>
      </body>
    </html>
  );
}
