import type { Metadata } from "next";
// Import server initialization - this will only run in Node.js environments
import '../server-init';
import { Geist, Geist_Mono } from "next/font/google";
import LayoutContent from "./LayoutContent";
import GoogleAnalyticsWrapper from "@/components/analytics/GoogleAnalyticsWrapper";
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
  title: "TruyenLight - Đọc Truyện Online",
  description: "Đọc truyện online, truyện hay, truyện chữ.",
  icons: {
    icon: [
      { url: '/Favicon.png', sizes: 'any' }
    ],
    apple: [
      { url: '/Favicon.png' }
    ],
    shortcut: [
      { url: '/Favicon.png' }
    ]
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
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
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalyticsWrapper measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
      <body className={bodyClasses}>
        <LayoutContent>
          {children}
        </LayoutContent>
      </body>
    </html>
  );
}
