// app/dashboard/widget/page.tsx

"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { useModal } from "@/components/ui/modal";
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
  const { showSuccess, showInfo, showWarning, showError, showConfirm } = useModal();
  const [activeTab, setActiveTab] = useState<WidgetTabType>("status");
  
  // وضعیت ویجت
  const [widgetStatus, setWidgetStatus] = useState<WidgetStatus>(initialWidgetStatus);

  // تنظیمات ظاهری ویجت
  const [widgetAppearance, setWidgetAppearance] = useState<WidgetAppearance>(initialWidgetAppearance);

  // تنظیمات فرم (در حالت واقعی از stateهای داخل WidgetFormTab می‌آید)
  const [hasFormChanges, setHasFormChanges] = useState(false);

  // تنظیمات مسیر ارجاع (در حالت واقعی از stateهای داخل WidgetReferrerTab می‌آید)
  const [hasReferrerChanges, setHasReferrerChanges] = useState(false);

  // محاسبه تغییرات با useMemo (بدون نیاز به useEffect)
  const hasStatusChanges = useMemo(() => {
    return JSON.stringify(initialWidgetStatus) !== JSON.stringify(widgetStatus);
  }, [widgetStatus]);

  const hasAppearanceChanges = useMemo(() => {
    return JSON.stringify(initialWidgetAppearance) !== JSON.stringify(widgetAppearance);
  }, [widgetAppearance]);

  const hasAnyChanges = hasStatusChanges || hasAppearanceChanges || hasFormChanges || hasReferrerChanges;

  // توابع ذخیره‌سازی
  const handleSaveStatus = () => {
    // در حالت واقعی، اینجا درخواست API زده می‌شود
    console.log("تنظیمات وضعیت ویجت ذخیره شد:", widgetStatus);
    showSuccess("تنظیمات وضعیت ویجت با موفقیت ذخیره شد", "موفقیت ✨");
  };

  const handleSaveAppearance = () => {
    console.log("تنظیمات ظاهری ویجت ذخیره شد:", widgetAppearance);
    showSuccess("تنظیمات ظاهری ویجت با موفقیت ذخیره شد", "موفقیت ✨");
  };

  const handleSaveForm = () => {
    console.log("تنظیمات فرم شروع گفتگو ذخیره شد");
    showSuccess("تنظیمات فرم شروع گفتگو با موفقیت ذخیره شد", "موفقیت ✨");
  };

  const handleSaveReferrer = () => {
    console.log("تنظیمات مسیر ارجاع ذخیره شد");
    showSuccess("تنظیمات مسیر ارجاع با موفقیت ذخیره شد", "موفقیت ✨");
  };

  const handleSaveAll = () => {
    if (hasStatusChanges) handleSaveStatus();
    if (hasAppearanceChanges) handleSaveAppearance();
    if (hasFormChanges) handleSaveForm();
    if (hasReferrerChanges) handleSaveReferrer();
    
    if (!hasAnyChanges) {
      showInfo("هیچ تغییری برای ذخیره وجود ندارد", "اطلاعات");
    }
  };

  const handleResetStatus = () => {
    showConfirm(
      "آیا از بازگشت به تنظیمات اولیه وضعیت ویجت مطمئن هستید؟",
      "تایید بازگشت",
      () => {
        setWidgetStatus(initialWidgetStatus);
        showSuccess("تنظیمات وضعیت ویجت به حالت اولیه بازگشت", "موفقیت ✨");
      }
    );
  };

  const handleResetAppearance = () => {
    showConfirm(
      "آیا از بازگشت به تنظیمات اولیه ظاهری ویجت مطمئن هستید؟",
      "تایید بازگشت",
      () => {
        setWidgetAppearance(initialWidgetAppearance);
        showSuccess("تنظیمات ظاهری ویجت به حالت اولیه بازگشت", "موفقیت ✨");
      }
    );
  };

  const handleToggleStatus = () => {
    const newStatus = !widgetStatus.isActive;
    const statusText = newStatus ? "فعال" : "غیرفعال";
    
    showConfirm(
      `آیا از ${newStatus ? "فعال‌سازی" : "غیرفعال‌سازی"} ویجت مطمئن هستید؟`,
      `تایید ${newStatus ? "فعال‌سازی" : "غیرفعال‌سازی"}`,
      () => {
        setWidgetStatus({ ...widgetStatus, isActive: newStatus });
        showSuccess(`ویجت با موفقیت ${statusText} شد`, "موفقیت ✨");
      }
    );
  };

  const handleCheckConnection = () => {
    // شبیه‌سازی بررسی اتصال
    showSuccess("اتصال با موفقیت برقرار است", "اتصال پایدار ✅");
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