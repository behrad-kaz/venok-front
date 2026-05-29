// components/layout/ClientLayout.tsx
"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // بررسی می‌کنیم که آیا مسیر فعلی با /dashboard شروع می‌شود
  const isDashboardPage = pathname?.startsWith("/dashboard");

  return (
    <>
      {isDashboardPage && <Header />}
      {children}
    </>
  );
}