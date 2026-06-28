// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import { ModalProvider } from "@/components/ui/modal"; // ✅ اضافه شده

export const metadata: Metadata = {
  title: "پشتیبانی آنلاین - پشتیبان یار",
  description: "سیستم پشتیبانی آنلاین فروشگاه نمونه",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ModalProvider> {/* ✅ اضافه شده */}
            {children}
        </ModalProvider>
      </body>
    </html>
  );
}