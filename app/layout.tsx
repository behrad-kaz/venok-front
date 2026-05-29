// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

export const metadata: Metadata = {
  title: " پشتیبانی آنلاین - پشتیبان یار",
  description: "سیستم پشتیبانی آنلاین فروشگاه نمونه",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>

          {children}

      </body>
    </html>
  );
}