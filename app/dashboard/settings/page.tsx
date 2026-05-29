// app/dashboard/settings/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Link from "next/link";
import CompanyInfo from "@/components/dashboard/settings/CompanyInfo";
import WidgetInstall from "@/components/dashboard/settings/WidgetInstall";
import SmsSettings from "@/components/dashboard/settings/SmsSettings";
import AllowedDomains from "@/components/dashboard/settings/AllowedDomains";
import SecuritySettings from "@/components/dashboard/settings/SecuritySettings";
import AccessSummary from "@/components/dashboard/settings/AccessSummary";

export default function SettingsPage() {
  const [companyData, setCompanyData] = useState({
    name: "آژانس سفر نمونه",
    email: "support@example.ir",
    phone: "021-12345678",
    website: "https://example.ir",
  });

  const [smsData, setSmsData] = useState({
    senderNumber: "30007732123456",
    apiKey: "sk_sms_*****3456",
    isEnabled: true,
    isConnected: true,
  });

  const [domains, setDomains] = useState(["example.ir", "www.example.ir", "shop.example.ir"]);
  const [securityData, setSecurityData] = useState({
    twoFactor: false,
    autoClose: true,
    emailNotification: false,
  });
  const [isWidgetActive, setIsWidgetActive] = useState(true);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* دکمه صفحه اصلی */}
        <div className="relative">
          <Link
            href="/"
            className="absolute top-0 left-0 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[#59D8C3]/20 text-[11px] text-gray-400 hover:text-white hover:border-[#59D8C3]/40 transition-all duration-300"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            <span>صفحه اصلی</span>
          </Link>
          <div className="pt-10">
            <h1 className="text-2xl font-bold text-white">تنظیمات</h1>
            <p className="text-gray-400 text-sm mt-0.5">مدیریت ورک‌اسپیس آژانس سفر نمونه</p>
          </div>
        </div>

        {/* اطلاعات شرکت */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <CompanyInfo data={companyData} onUpdate={setCompanyData} />
        </motion.div>

        {/* نصب ویجت */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <WidgetInstall isActive={isWidgetActive} onToggle={() => setIsWidgetActive(!isWidgetActive)} />
        </motion.div>

        {/* ارسال پیامک */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SmsSettings data={smsData} onUpdate={setSmsData} />
        </motion.div>

        {/* دامنه‌های مجاز */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <AllowedDomains domains={domains} onUpdate={setDomains} />
        </motion.div>

        {/* امنیت */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <SecuritySettings data={securityData} onUpdate={setSecurityData} />
        </motion.div>

        {/* خلاصه دسترسی‌ها */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <AccessSummary counts={{ admin: 1, manager: 4, staff: 9 }} />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}