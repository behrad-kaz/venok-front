// app/dashboard/workspace-settings/page.tsx

"use client";

import { useState, useEffect } from "react";
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
import { 
  WorkspaceTabType, 
  CompanyInfo, 
  SupportInfo, 
  WorkingHours, 
  NotificationSettings, 
  SecuritySettings,
  SetupItem,
  Session
} from "@/components/dashboard/workspace-settings/types";

// داده‌های اولیه
const initialCompanyInfo: CompanyInfo = {
  name: "آژانس مسافرتی سفر آسان",
  domain: "https://agency.example.com",
  description: "ارائه‌دهنده خدمات مسافرتی، رزرو هتل و بلیط هواپیما",
  logo: null,
};

const initialSupportInfo: SupportInfo = {
  phone: "۰۲۱-۱۲۳۴۵۶۷۸",
  email: "support@agency.example.com",
  alertPhone: "۰۹۱۲-۱۲۳-۴۵۶۷",
  introText: "تیم پشتیبانی ما آماده پاسخگویی به سوالات شما است.",
};

const initialWorkingHours: WorkingHours = {
  workingDays: {
    saturday: true,
    sunday: true,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: false,
  },
  startTime: "09:00",
  endTime: "18:00",
  timezone: "Asia/Tehran",
  outOfHoursMessage: "در حال حاضر خارج از ساعات پاسخ‌گویی هستیم. پیام شما ثبت شد و در اولین فرصت پاسخ می‌دهیم.",
};

const initialNotificationSettings: NotificationSettings = {
  sendLinkSms: true,
  sendOtpForPasswordChange: true,
  notifyManagerForUnanswered: true,
  notifyNewConversations: true,
};

const initialSecuritySettings: SecuritySettings = {
  requireStrongPassword: true,
  requirePhoneVerificationForPasswordChange: true,
  autoLogoutMinutes: 60,
};

const initialSessions: Session[] = [
  {
    id: "1",
    device: "MacBook Pro",
    deviceType: "desktop",
    browser: "Chrome 118",
    location: "تهران، ایران",
    lastActivity: "الان",
    isCurrent: true,
  },
  {
    id: "2",
    device: "iPhone 15",
    deviceType: "mobile",
    browser: "Safari",
    location: "تهران، ایران",
    lastActivity: "۲ ساعت پیش",
    isCurrent: false,
  },
  {
    id: "3",
    device: "Windows PC",
    deviceType: "desktop",
    browser: "Edge 119",
    location: "اصفهان، ایران",
    lastActivity: "۱ روز پیش",
    isCurrent: false,
  },
];

const initialSetupItems: SetupItem[] = [
  { id: "1", title: "اطلاعات شرکت ثبت شده", completed: true, action: undefined },
  { id: "2", title: "دپارتمان‌ها ایجاد شده‌اند", completed: true, action: undefined },
  { id: "3", title: "اعضا اضافه شده‌اند", completed: true, action: undefined },
  { id: "4", title: "موضوع‌ها به دپارتمان‌ها متصل شده‌اند", completed: true, action: undefined },
  { id: "5", title: "ویجت سایت تنظیم شده", completed: true, action: undefined },
  { id: "6", title: "کد ویجت نصب شده", completed: false, action: undefined },
];

export default function WorkspaceSettingsPage() {
  const [activeTab, setActiveTab] = useState<WorkspaceTabType>("company");
  
  // Stateها
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);
  const [supportInfo, setSupportInfo] = useState<SupportInfo>(initialSupportInfo);
  const [workingHours, setWorkingHours] = useState<WorkingHours>(initialWorkingHours);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotificationSettings);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(initialSecuritySettings);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [setupItems, setSetupItems] = useState<SetupItem[]>(initialSetupItems);

  // وضعیت تغییرات
  const [hasChanges, setHasChanges] = useState(false);

  const smsCredit = 5420;
  const smsStatus = "connected";
  const lastSmsSent = "۲ ساعت پیش";

  const completedCount = setupItems.filter(item => item.completed).length;
  const totalCount = setupItems.length;

  // بررسی تغییرات
  useEffect(() => {
    const hasCompany = JSON.stringify(companyInfo) !== JSON.stringify(initialCompanyInfo);
    const hasSupport = JSON.stringify(supportInfo) !== JSON.stringify(initialSupportInfo);
    const hasHours = JSON.stringify(workingHours) !== JSON.stringify(initialWorkingHours);
    const hasNotifications = JSON.stringify(notificationSettings) !== JSON.stringify(initialNotificationSettings);
    const hasSecurity = JSON.stringify(securitySettings) !== JSON.stringify(initialSecuritySettings) || 
                        JSON.stringify(sessions) !== JSON.stringify(initialSessions);
    const hasSetup = JSON.stringify(setupItems) !== JSON.stringify(initialSetupItems);
    
    const anyChanges = hasCompany || hasSupport || hasHours || hasNotifications || hasSecurity || hasSetup;
    setHasChanges(anyChanges);
  }, [companyInfo, supportInfo, workingHours, notificationSettings, securitySettings, sessions, setupItems]);

  const handleCompleteSetupItem = (itemId: string) => {
    setSetupItems(items => items.map(item => 
      item.id === itemId ? { ...item, completed: true } : item
    ));
  };

  const handleLogoutAll = () => {
    // حذف همه نشست‌ها به جز نشست فعلی
    const otherSessions = sessions.filter(session => !session.isCurrent);
    
    if (otherSessions.length === 0) {
      alert("هیچ نشست فعال دیگری وجود ندارد");
      return;
    }
    
    const currentSession = sessions.find(session => session.isCurrent === true);
    if (currentSession) {
      setSessions([currentSession]);
      alert(`${otherSessions.length} نشست با موفقیت حذف شد`);
    } else {
      setSessions([]);
      alert("همه نشست‌ها حذف شدند");
    }
  };

  const handleLogoutSession = (sessionId: string) => {
    // اطمینان از اینکه نشست فعلی را حذف نمی‌کنیم
    const sessionToRemove = sessions.find(s => s.id === sessionId);
    if (sessionToRemove?.isCurrent) {
      alert("نمی‌توانید از نشست فعلی خارج شوید");
      return;
    }
    
    setSessions(sessions.filter(s => s.id !== sessionId));
    alert("خروج از نشست انجام شد");
  };

  const handleCheckSmsConnection = () => {
    alert("اتصال پیامک برقرار است");
  };

  const handleSave = () => {
    // ذخیره اطلاعات شرکت در localStorage
    localStorage.setItem("companyName", companyInfo.name);
    localStorage.setItem("companyDescription", companyInfo.description);
    if (companyInfo.logo) {
      localStorage.setItem("companyLogo", companyInfo.logo);
    } else {
      localStorage.removeItem("companyLogo");
    }
    
    alert("تنظیمات با موفقیت ذخیره شد");
    setHasChanges(false);
  };

  const handleCancel = () => {
    // بازگردانی به مقادیر اولیه
    setCompanyInfo(initialCompanyInfo);
    setSupportInfo(initialSupportInfo);
    setWorkingHours(initialWorkingHours);
    setNotificationSettings(initialNotificationSettings);
    setSecuritySettings(initialSecuritySettings);
    setSessions(initialSessions);
    setSetupItems(initialSetupItems);
    alert("تغییرات لغو شد");
    setHasChanges(false);
  };

  return (
    <RoleGuard allowedRoles={["مدیر کل"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* هشدار تغییرات ذخیره نشده */}
          {hasChanges && (
            <WorkspaceUnsavedAlert onSave={handleSave} onCancel={handleCancel} />
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
              className="px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all"
            >
              ذخیره تنظیمات
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