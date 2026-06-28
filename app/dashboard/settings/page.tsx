"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { useRoleStore } from "@/stores/useRoleStore";
import { useModal } from "@/components/ui/modal";

// کامپوننت‌های تنظیمات دپارتمان
import DepartmentSettingsTabs from "@/components/dashboard/settings/department/DepartmentSettingsTabs";
import DepartmentInfoTab from "@/components/dashboard/settings/department/DepartmentInfoTab";
import DepartmentMessagesTab from "@/components/dashboard/settings/department/DepartmentMessagesTab";
import DepartmentHoursTab from "@/components/dashboard/settings/department/DepartmentHoursTab";
import DepartmentRulesTab from "@/components/dashboard/settings/department/DepartmentRulesTab";
import DepartmentSettingsActions from "@/components/dashboard/settings/department/DepartmentSettingsActions";
import DepartmentUnsavedChangesAlert from "@/components/dashboard/settings/department/DepartmentUnsavedChangesAlert";

// انواع داده
import { TabType, DepartmentInfo, DepartmentMessages, WorkingHours } from "@/components/dashboard/settings/department/types";

// داده‌های اولیه (برای تشخیص تغییرات)
const initialDepartmentInfo: DepartmentInfo = {
  name: "پشتیبانی",
  description: "دپارتمان پشتیبانی عمومی و رفع مشکلات مشتریان",
  status: true,
  manager: "امیر حسینی",
  memberCount: 5,
  openTickets: 12,
};

const initialMessages: DepartmentMessages = {
  welcome: "سلام، به دپارتمان پشتیبانی خوش آمدید. پیام شما دریافت شد.",
  waiting: "کارشناسان ما در حال بررسی پیام شما هستند.",
  outOfHours: "در حال حاضر خارج از ساعات پاسخ‌گویی این دپارتمان هستیم.",
  closed: "این گفتگو بسته شد. در صورت نیاز می‌توانید دوباره پیام ارسال کنید.",
};

const initialWorkingHours: WorkingHours = {
  useWorkspaceHours: false,
  enabled: true,
  startTime: "09:00",
  endTime: "18:00",
  timezone: "Asia/Tehran",
  workingDays: {
    saturday: true,
    sunday: true,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: false,
  },
  outOfHoursMessage: "در حال حاضر خارج از ساعات پاسخ‌گویی هستیم. پیام شما ثبت شد و در اولین فرصت پاسخ می‌دهیم.",
};

const initialRoutingRule = "queue";

export default function DepartmentSettingsPage() {
  const { role } = useRoleStore();
  const { showSuccess, showInfo, showWarning, showError, showConfirm } = useModal();
  const [activeTab, setActiveTab] = useState<TabType>("info");

  // اطلاعات دپارتمان
  const [departmentInfo, setDepartmentInfo] = useState<DepartmentInfo>(initialDepartmentInfo);

  // پیام‌های دپارتمان
  const [messages, setMessages] = useState<DepartmentMessages>(initialMessages);

  // ساعات پاسخگویی
  const [workingHours, setWorkingHours] = useState<WorkingHours>(initialWorkingHours);

  // قوانین ورود گفتگو
  const [routingRule, setRoutingRule] = useState<string>(initialRoutingRule);

  // محاسبه تغییرات با useMemo (بدون نیاز به useEffect)
  const hasInfoChanges = useMemo(() => {
    return JSON.stringify(initialDepartmentInfo) !== JSON.stringify(departmentInfo);
  }, [departmentInfo]);

  const hasMessagesChanges = useMemo(() => {
    return JSON.stringify(initialMessages) !== JSON.stringify(messages);
  }, [messages]);

  const hasHoursChanges = useMemo(() => {
    return JSON.stringify(initialWorkingHours) !== JSON.stringify(workingHours);
  }, [workingHours]);

  const hasRulesChanges = useMemo(() => {
    return initialRoutingRule !== routingRule;
  }, [routingRule]);

  const hasAnyChanges = hasInfoChanges || hasMessagesChanges || hasHoursChanges || hasRulesChanges;

  const handleSave = () => {
    console.log("تنظیمات ذخیره شد:", { departmentInfo, messages, workingHours, routingRule });
    showSuccess("تنظیمات با موفقیت ذخیره شد", "موفقیت ✨");
  };

  const handleCancel = () => {
    // بازگردانی به مقادیر اولیه
    setDepartmentInfo(initialDepartmentInfo);
    setMessages(initialMessages);
    setWorkingHours(initialWorkingHours);
    setRoutingRule(initialRoutingRule);
    showInfo("تغییرات با موفقیت لغو شد", "اطلاعات");
  };

  // اگر نقش مدیر دپارتمان نیست، دسترسی ندارد
  if (role !== "مدیر") {
    return (
      <RoleGuard allowedRoles={["مدیر"]}>
        <DashboardLayout>
          <div className="text-center py-12">
            <p className="text-gray-400">شما دسترسی به این صفحه را ندارید</p>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["مدیر"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* هشدار تغییرات ذخیره نشده */}
          {hasAnyChanges && (
            <DepartmentUnsavedChangesAlert 
              onSave={handleSave} 
              onCancel={handleCancel} 
            />
          )}

          {/* تب‌ها */}
          <DepartmentSettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* محتوای تب‌ها */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
            {activeTab === "info" && (
              <DepartmentInfoTab info={departmentInfo} onInfoChange={setDepartmentInfo} />
            )}
            {activeTab === "messages" && (
              <DepartmentMessagesTab messages={messages} onMessagesChange={setMessages} />
            )}
            {activeTab === "hours" && (
              <DepartmentHoursTab workingHours={workingHours} onWorkingHoursChange={setWorkingHours} />
            )}
            {activeTab === "rules" && (
              <DepartmentRulesTab routingRule={routingRule} onRoutingRuleChange={setRoutingRule} />
            )}
          </div>

          {/* دکمه‌های اقدام */}
          <DepartmentSettingsActions onSave={handleSave} onCancel={handleCancel} />
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}