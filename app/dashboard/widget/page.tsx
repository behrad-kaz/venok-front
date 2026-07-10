// app/dashboard/widget/page.tsx

"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { useModal } from "@/components/ui/modal";
import WidgetTabs from "@/components/dashboard/widget/WidgetTabs";
import WidgetStatusTab from "@/components/dashboard/widget/WidgetStatusTab";
import WidgetAppearanceTab from "@/components/dashboard/widget/WidgetAppearanceTab";
import WidgetFormTab from "@/components/dashboard/widget/WidgetFormTab";
import WidgetPreviewTab from "@/components/dashboard/widget/WidgetPreviewTab";
import WidgetUnsavedAlert from "@/components/dashboard/widget/WidgetUnsavedAlert";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";
import { WidgetTabType } from "@/components/dashboard/widget/types";

export default function WidgetPage() {
  const { showInfo, showConfirm } = useModal();
  const [activeTab, setActiveTab] = useState<WidgetTabType>("status");
  
  const {
    config,
    isLoading,
    isSaving,
    hasChanges,
    updateField,
    handleSave,
    handleCancel,
    addDomain,
    removeDomain,
    toggleDepartmentStatus,
  } = useWidgetSettings();

  const handleToggleStatus = () => {
    const newStatus = !config.isActive;
    const statusText = newStatus ? "فعال" : "غیرفعال";
    
    showConfirm(
      `آیا از ${newStatus ? "فعال‌سازی" : "غیرفعال‌سازی"} ویجت مطمئن هستید؟`,
      `تایید ${newStatus ? "فعال‌سازی" : "غیرفعال‌سازی"}`,
      () => {
        updateField('isActive', newStatus);
        handleSave();
      }
    );
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["مدیر کل"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#59D8C3] border-t-transparent rounded-full animate-spin" />
            <span className="mr-3 text-gray-400">در حال بارگذاری تنظیمات ویجت...</span>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["مدیر کل"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* هشدار تغییرات ذخیره نشده */}
          {hasChanges && (
            <WidgetUnsavedAlert onSave={handleSave} onCancel={handleCancel} isSaving={isSaving} />
          )}

          {/* تب‌ها */}
          <WidgetTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* محتوای تب‌ها */}
          {activeTab === "status" && (
            <WidgetStatusTab
              config={config}
              onToggleStatus={handleToggleStatus}
              onAddDomain={addDomain}
              onRemoveDomain={removeDomain}
            />
          )}

          {activeTab === "appearance" && (
            <WidgetAppearanceTab config={config} onUpdate={updateField} />
          )}

          {activeTab === "form" && (
            <WidgetFormTab
              config={config}
              onUpdate={updateField}
              onToggleDepartment={toggleDepartmentStatus}
            />
          )}

          {activeTab === "preview" && (
            <WidgetPreviewTab config={config} />
          )}

          {/* دکمه‌های اقدام */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                isSaving || !hasChanges
                  ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#06110F] border-t-transparent rounded-full animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                'ذخیره تنظیمات'
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={!hasChanges}
              className={`px-6 py-3 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all ${
                !hasChanges ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              لغو تغییرات
            </button>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}