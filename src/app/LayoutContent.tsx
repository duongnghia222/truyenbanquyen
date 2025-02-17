'use client'

import { SessionProvider } from "next-auth/react";
import Header from "@/components/layout/Header";

export default function LayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <Header />
      <main className="pt-24">
        {children}
      </main>
    </SessionProvider>
  );
} 