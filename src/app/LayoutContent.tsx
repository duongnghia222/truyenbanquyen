'use client'

import { SessionProvider } from "next-auth/react";
import { Footer } from "@/components/layout/footer";
import Header from "@/components/layout/header/Header";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function LayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <Header />
        <main className="pt-24">
          {children}
        </main>
        <Footer />
      </ThemeProvider>
    </SessionProvider>
  );
} 