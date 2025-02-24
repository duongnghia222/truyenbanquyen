'use client'

import { SessionProvider } from "next-auth/react";
import Header from "@/components/common/layout/Header";
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
      </ThemeProvider>
    </SessionProvider>
  );
} 