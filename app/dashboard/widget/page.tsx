// app/dashboard/widget/page.tsx

"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RoleGuard from "@/components/dashboard/RoleGuard";
import WidgetTabs from "@/components/dashboard/widget/WidgetTabs";
import WidgetStatusTab from "@/components/dashboard/widget/WidgetStatusTab";
import WidgetAppearanceTab from "@/components/dashboard/widget/WidgetAppearanceTab";
import WidgetFormTab from "@/components/dashboard/widget/WidgetFormTab";
import WidgetReferrerTab from "@/components/dashboard/widget/WidgetReferrerTab";
import WidgetPreviewTab from "@/components/dashboard/widget/WidgetPreviewTab";
import WidgetUnsavedAlert from "@/components/dashboard/widget/WidgetUnsavedAlert";
import { WidgetTabType, WidgetStatus, WidgetAppearance } from "@/components/dashboard/widget/types";

// داده‌های اولیه
const initialWidgetStatus: WidgetStatus = {
  isActive: false,
  domain: "https://agency.example.com",
  lastRequest: "۵ دقیقه پیش",
  todayRequests: 24,
  totalConversations: 156,
  lastCheck: "۲ ساعت پیش",
};

const initialWidgetAppearance: WidgetAppearance = {
  primaryColor: "#59d8c3",
  position: "bottom-right",
  buttonStyle: "capsule",
  buttonSize: "medium",
  buttonText: "گفتگو با پشتیبانی",
  showLogo: true,
  showChatIcon: true,
};

export default function WidgetPage() {
  const [activeTab, setActiveTab] = useState<WidgetTabType>("status");
  
  // وضعیت ویجت
  const [widgetStatus, setWidgetStatus] = useState<WidgetStatus>(initialWidgetStatus);
  const [hasStatusChanges, setHasStatusChanges] = useState(false);

  // تنظیمات ظاهری ویجت
  const [widgetAppearance, setWidgetAppearance] = useState<WidgetAppearance>(initialWidgetAppearance);
  const [hasAppearanceChanges, setHasAppearanceChanges] = useState(false);

  // تنظیمات فرم (در حالت واقعی از stateهای داخل WidgetFormTab می‌آید)
  const [hasFormChanges, setHasFormChanges] = useState(false);

  // تنظیمات مسیر ارجاع (در حالت واقعی از stateهای داخل WidgetReferrerTab می‌آید)
  const [hasReferrerChanges, setHasReferrerChanges] = useState(false);

  // بررسی تغییرات
  useEffect(() => {
    setHasStatusChanges(JSON.stringify(initialWidgetStatus) !== JSON.stringify(widgetStatus));
  }, [widgetStatus]);

  useEffect(() => {
    setHasAppearanceChanges(JSON.stringify(initialWidgetAppearance) !== JSON.stringify(widgetAppearance));
  }, [widgetAppearance]);

  const hasAnyChanges = hasStatusChanges || hasAppearanceChanges || hasFormChanges || hasReferrerChanges;

  // توابع ذخیره‌سازی
  const handleSaveStatus = () => {
    // در حالت واقعی، اینجا درخواست API زده می‌شود
    alert("تنظیمات وضعیت ویجت ذخیره شد");
  };

  const handleSaveAppearance = () => {
    alert("تنظیمات ظاهری ویجت ذخیره شد");
  };

  const handleSaveForm = () => {
    alert("تنظیمات فرم شروع گفتگو ذخیره شد");
  };

  const handleSaveReferrer = () => {
    alert("تنظیمات مسیر ارجاع ذخیره شد");
  };

  const handleSaveAll = () => {
    if (hasStatusChanges) handleSaveStatus();
    if (hasAppearanceChanges) handleSaveAppearance();
    if (hasFormChanges) handleSaveForm();
    if (hasReferrerChanges) handleSaveReferrer();
  };

  const handleResetStatus = () => {
    setWidgetStatus(initialWidgetStatus);
  };

  const handleResetAppearance = () => {
    setWidgetAppearance(initialWidgetAppearance);
  };

  const handleToggleStatus = () => {
    setWidgetStatus({ ...widgetStatus, isActive: !widgetStatus.isActive });
  };

  const handleCheckConnection = () => {
    alert("اتصال با موفقیت برقرار است");
  };

  return (
    <RoleGuard allowedRoles={["مدیر کل"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* هشدار تغییرات ذخیره نشده */}
          {hasAnyChanges && (
            <WidgetUnsavedAlert onSave={handleSaveAll} />
          )}

          {/* تب‌ها */}
          <WidgetTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* محتوای تب‌ها */}
          {activeTab === "status" && (
            <WidgetStatusTab
              status={widgetStatus}
              onToggleStatus={handleToggleStatus}
              onCheckConnection={handleCheckConnection}
            />
          )}

          {activeTab === "appearance" && (
            <WidgetAppearanceTab
              appearance={widgetAppearance}
              onAppearanceChange={setWidgetAppearance}
              onSave={handleSaveAppearance}
              onReset={handleResetAppearance}
            />
          )}

          {activeTab === "form" && (
            <WidgetFormTab 
              onSave={handleSaveForm} 
              onReset={() => setHasFormChanges(false)}
              onHasChangesChange={setHasFormChanges}
            />
          )}

          {activeTab === "referrer" && (
            <WidgetReferrerTab 
              onSave={handleSaveReferrer} 
              onReset={() => setHasReferrerChanges(false)}
              onHasChangesChange={setHasReferrerChanges}
            />
          )}

          {activeTab === "preview" && (
            <WidgetPreviewTab
              primaryColor={widgetAppearance.primaryColor}
              buttonText={widgetAppearance.buttonText}
              buttonStyle={widgetAppearance.buttonStyle}
              buttonSize={widgetAppearance.buttonSize}
            />
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}