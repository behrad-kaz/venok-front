"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RoleGuard from "@/components/dashboard/RoleGuard";
import WorkspaceSettingsTabs from "@/components/dashboard/workspace-settings/WorkspaceSettingsTabs";
import WorkspaceCompanyTab from "@/components/dashboard/workspace-settings/WorkspaceCompanyTab";
import WorkspaceSupportTab from "@/components/dashboard/workspace-settings/WorkspaceSupportTab";
import WorkspaceHoursTab from "@/components/dashboard/workspace-settings/WorkspaceHoursTab";
import WorkspaceNotificationsTab from "@/components/dashboard/workspace-settings/WorkspaceNotificationsTab";
import WorkspaceSecurityTab from "@/components/dashboard/workspace-settings/WorkspaceSecurityTab";
import WorkspaceSetupTab from "@/components/dashboard/workspace-settings/WorkspaceSetupTab";
import WorkspaceUnsavedAlert from "@/components/dashboard/workspace-settings/WorkspaceUnsavedAlert";
import { WorkspaceTabType } from "@/components/dashboard/workspace-settings/types";
import { useWorkspaceSettings } from "@/hooks/useWorkspaceSettings";

export default function WorkspaceSettingsPage() {
  const [activeTab, setActiveTab] = useState<WorkspaceTabType>("company");
  
  const {
    // Stateها
    companyInfo,
    supportInfo,
    workingHours,
    notificationSettings,
    securitySettings,
    sessions,
    setupItems,
    isSaving,
    hasChanges,
    
    // Setters
    setCompanyInfo,
    setSupportInfo,
    setWorkingHours,
    setNotificationSettings,
    setSecuritySettings,
    setSessions,
    setSetupItems,
    
    // Handlers
    handleCompleteSetupItem,
    handleLogoutAll,
    handleLogoutSession,
    handleCheckSmsConnection,
    handleSave,
    handleCancel,
    
    // Data
    smsCredit,
    smsStatus,
    lastSmsSent,
    completedCount,
    totalCount,
  } = useWorkspaceSettings();

  return (
    <RoleGuard allowedRoles={["مدیر کل"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* هشدار تغییرات ذخیره نشده */}
          {hasChanges && (
            <WorkspaceUnsavedAlert 
              onSave={handleSave} 
              onCancel={handleCancel}
              isSaving={isSaving}  // ✅ پاس دادن isSaving
            />
          )}

          {/* تب‌ها */}
          <WorkspaceSettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* محتوای تب‌ها */}
          {activeTab === "company" && (
            <WorkspaceCompanyTab info={companyInfo} onInfoChange={setCompanyInfo} />
          )}

          {activeTab === "support" && (
            <WorkspaceSupportTab info={supportInfo} onInfoChange={setSupportInfo} />
          )}

          {activeTab === "hours" && (
            <WorkspaceHoursTab hours={workingHours} onHoursChange={setWorkingHours} />
          )}

          {activeTab === "notifications" && (
            <WorkspaceNotificationsTab
              settings={notificationSettings}
              onSettingsChange={setNotificationSettings}
              smsCredit={smsCredit}
              smsStatus={smsStatus}
              lastSmsSent={lastSmsSent}
              onCheckSmsConnection={handleCheckSmsConnection}
            />
          )}

          {activeTab === "security" && (
            <WorkspaceSecurityTab
              settings={securitySettings}
              onSettingsChange={setSecuritySettings}
              sessions={sessions}
              onLogoutAll={handleLogoutAll}
              onLogoutSession={handleLogoutSession}
            />
          )}

          {activeTab === "setup" && (
            <WorkspaceSetupTab
              items={setupItems}
              completedCount={completedCount}
              totalCount={totalCount}
              onCompleteItem={handleCompleteSetupItem}
            />
          )}

          {/* دکمه‌های اقدام */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                isSaving
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
              className="px-6 py-3 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
            >
              لغو تغییرات
            </button>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}