// hooks/useWorkspaceSettings.ts
import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  CompanyInfo,
  SupportInfo,
  WorkingHours,
  NotificationSettings,
  SecuritySettings,
  SetupItem,
  Session,
} from '@/components/dashboard/workspace-settings/types';
import {
  updateWorkspace,
  uploadLogo,
  getLogoUrl,
  updateOrganization,
  getTokens,
} from '@/services/onboardingApi';

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

// تابع تولید slug
const generateSlug = (name: string): string => {
  const baseName = name.trim() || 'workspace';
  let slug = baseName.toLowerCase();
  
  const persianMap: Record<string, string> = {
    'آ': 'a', 'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's',
    'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z',
    'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's',
    'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f',
    'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'و': 'v', 'ه': 'h', 'ی': 'y', ' ': '-', '_': '-'
  };
  
  slug = slug.split('').map(char => persianMap[char] || char).join('');
  slug = slug.replace(/[^a-z0-9-]/g, '');
  slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  if (!slug) slug = 'workspace';
  
  return `${slug}-${Date.now()}`;
};

// ✅ مقداردهی اولیه با رشته‌های خالی (بدون دسترسی به localStorage)
const getInitialCompanyInfo = (): CompanyInfo => {
  return {
    name: "",
    domain: "",
    description: "",
    logo: null,
    phone: "",
    email: "",
    logoFile: null,
  };
};

const getInitialSupportInfo = (): SupportInfo => {
  return {
    phone: "",
    email: "",
    alertPhone: "",
    introText: "",
  };
};

// ✅ تابع دریافت اطلاعات ذخیره شده از localStorage برای استفاده در handleCancel
const getSavedCompanyInfo = (): Partial<CompanyInfo> => {
  if (typeof window === 'undefined') return {};
  
  const savedName = localStorage.getItem("companyName");
  const savedLogo = localStorage.getItem("companyLogo");
  const savedDesc = localStorage.getItem("companyDescription");
  
  return {
    name: savedName || undefined,
    logo: savedLogo || null,
    description: savedDesc || undefined,
  };
};

const getSavedSupportInfo = (): Partial<SupportInfo> => {
  if (typeof window === 'undefined') return {};
  
  const savedPhone = localStorage.getItem("supportPhone");
  const savedEmail = localStorage.getItem("supportEmail");
  const savedAlertPhone = localStorage.getItem("supportAlertPhone");
  const savedIntroText = localStorage.getItem("supportIntroText");
  
  return {
    phone: savedPhone || undefined,
    email: savedEmail || undefined,
    alertPhone: savedAlertPhone || undefined,
    introText: savedIntroText || undefined,
  };
};

export function useWorkspaceSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // ✅ مقداردهی اولیه با رشته‌های خالی
  const [baseCompanyInfo, setBaseCompanyInfo] = useState<CompanyInfo>(getInitialCompanyInfo);
  const [baseSupportInfo, setBaseSupportInfo] = useState<SupportInfo>(getInitialSupportInfo);

  // Stateها با مقداردهی اولیه خالی
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(getInitialCompanyInfo);
  const [supportInfo, setSupportInfo] = useState<SupportInfo>(getInitialSupportInfo);
  const [workingHours, setWorkingHours] = useState<WorkingHours>(initialWorkingHours);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotificationSettings);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(initialSecuritySettings);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [setupItems, setSetupItems] = useState<SetupItem[]>(initialSetupItems);

  // ✅ بارگذاری اطلاعات از localStorage فقط در کلاینت (بعد از Hydration)
  useEffect(() => {
    const savedName = localStorage.getItem("companyName");
    const savedLogo = localStorage.getItem("companyLogo");
    const savedDesc = localStorage.getItem("companyDescription");
    
    const newCompanyInfo: CompanyInfo = {
      ...companyInfo,
      name: savedName || "",
      logo: savedLogo || null,
      description: savedDesc || "",
    };
    
    setCompanyInfo(newCompanyInfo);
    setBaseCompanyInfo(newCompanyInfo);
    
    const savedPhone = localStorage.getItem("supportPhone");
    const savedEmail = localStorage.getItem("supportEmail");
    const savedAlertPhone = localStorage.getItem("supportAlertPhone");
    const savedIntroText = localStorage.getItem("supportIntroText");
    
    const newSupportInfo: SupportInfo = {
      ...supportInfo,
      phone: savedPhone || "",
      email: savedEmail || "",
      alertPhone: savedAlertPhone || "",
      introText: savedIntroText || "",
    };
    
    setSupportInfo(newSupportInfo);
    setBaseSupportInfo(newSupportInfo);
    
    setIsDataLoaded(true);
  }, []);

  // ✅ استفاده از useMemo برای محاسبه تغییرات
  const hasChanges = useMemo(() => {
    // اگر داده‌ها هنوز بارگذاری نشدن، تغییرات رو false در نظر بگیر
    if (!isDataLoaded) return false;
    
    const hasCompany = JSON.stringify(companyInfo) !== JSON.stringify(baseCompanyInfo);
    const hasSupport = JSON.stringify(supportInfo) !== JSON.stringify(baseSupportInfo);
    const hasHours = JSON.stringify(workingHours) !== JSON.stringify(initialWorkingHours);
    const hasNotifications = JSON.stringify(notificationSettings) !== JSON.stringify(initialNotificationSettings);
    const hasSecurity = JSON.stringify(securitySettings) !== JSON.stringify(initialSecuritySettings) || 
                        JSON.stringify(sessions) !== JSON.stringify(initialSessions);
    const hasSetup = JSON.stringify(setupItems) !== JSON.stringify(initialSetupItems);
    
    return hasCompany || hasSupport || hasHours || hasNotifications || hasSecurity || hasSetup;
  }, [
    isDataLoaded,
    companyInfo, 
    baseCompanyInfo, 
    supportInfo, 
    baseSupportInfo, 
    workingHours, 
    notificationSettings, 
    securitySettings, 
    sessions, 
    setupItems
  ]);

  // تکمیل آیتم راه‌اندازی
  const handleCompleteSetupItem = useCallback((itemId: string) => {
    setSetupItems(items => items.map(item => 
      item.id === itemId ? { ...item, completed: true } : item
    ));
  }, []);

  // خروج از همه نشست‌ها
  const handleLogoutAll = useCallback(() => {
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
  }, [sessions]);

  // خروج از یک نشست خاص
  const handleLogoutSession = useCallback((sessionId: string) => {
    const sessionToRemove = sessions.find(s => s.id === sessionId);
    if (sessionToRemove?.isCurrent) {
      alert("نمی‌توانید از نشست فعلی خارج شوید");
      return;
    }
    
    setSessions(sessions.filter(s => s.id !== sessionId));
    alert("خروج از نشست انجام شد");
  }, [sessions]);

  // بررسی اتصال پیامک
  const handleCheckSmsConnection = useCallback(() => {
    alert("اتصال پیامک برقرار است");
  }, []);

  // ذخیره تنظیمات
  const handleSave = useCallback(async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    
    try {
      const { accessToken, contextToken } = getTokens();
      if (!accessToken) {
        alert("توکن معتبر یافت نشد. لطفاً دوباره وارد شوید.");
        setIsSaving(false);
        return;
      }

      const workspaceId = localStorage.getItem("currentWorkspaceId");
      if (!workspaceId) {
        alert("شناسه workspace یافت نشد");
        setIsSaving(false);
        return;
      }

      const slug = generateSlug(companyInfo.name);
      
      // 1. به‌روزرسانی workspace با نام، شماره تماس و ایمیل
      console.log('📤 ارسال به سرور (PATCH /workspace):', {
        name: companyInfo.name,
        phone: supportInfo.phone || '',
        email: supportInfo.email || '',
        slug: slug,
      });
      
      await updateWorkspace(
        {
          name: companyInfo.name,
          phone: supportInfo.phone || '',
          email: supportInfo.email || '',
          slug: slug,
        },
        accessToken,
        contextToken
      );
      
      console.log('✅ به‌روزرسانی workspace با شماره تماس و ایمیل پشتیبانی موفقیت‌آمیز بود');

      let newLogoUrl = companyInfo.logo;

      // 2. آپلود لوگو
      const logoFile = companyInfo.logoFile;
      if (logoFile) {
        const uploadResult = await uploadLogo(logoFile, accessToken, contextToken);
        const fileResult = await getLogoUrl(uploadResult.id, accessToken, contextToken);
        newLogoUrl = fileResult.url;
        
        const currentOrganization = localStorage.getItem('currentOrganization');
        if (currentOrganization) {
          const organization = JSON.parse(currentOrganization);
          const slugOrg = generateSlug(companyInfo.name);
          
          await updateOrganization(
            {
              name: organization.name || companyInfo.name,
              legalName: organization.legalName || companyInfo.name,
              slug: organization.slug || slugOrg,
              type: organization.type || 'cafe',
              legalType: organization.legalType || 'individual',
              logo: fileResult.url,
              nationalId: organization.nationalId || '',
              taxId: organization.taxId || '',
              website: organization.website || '',
              currency: organization.currency || 'IRR',
              locale: organization.locale || 'fa-IR',
            },
            accessToken,
            contextToken
          );
        }
        
        localStorage.setItem("companyLogo", fileResult.url);
        window.dispatchEvent(new CustomEvent('companyUpdated'));
      }

      // 3. ذخیره در localStorage
      localStorage.setItem("companyName", companyInfo.name);
      localStorage.setItem("companyDescription", companyInfo.description);
      if (newLogoUrl) {
        localStorage.setItem("companyLogo", newLogoUrl);
      }
      
      // ✅ ذخیره اطلاعات پشتیبانی در localStorage
      localStorage.setItem("supportPhone", supportInfo.phone);
      localStorage.setItem("supportEmail", supportInfo.email);
      localStorage.setItem("supportAlertPhone", supportInfo.alertPhone);
      localStorage.setItem("supportIntroText", supportInfo.introText);
      
      window.dispatchEvent(new CustomEvent('companyUpdated'));
      
      // ✅ به‌روزرسانی companyInfo با مقادیر جدید
      const updatedCompanyInfo: CompanyInfo = {
        ...companyInfo,
        logo: newLogoUrl,
        logoFile: null,
      };
      
      setCompanyInfo(updatedCompanyInfo);
      setBaseCompanyInfo(updatedCompanyInfo);
      
      // ✅ به‌روزرسانی supportInfo با مقادیر جدید
      const updatedSupportInfo: SupportInfo = {
        ...supportInfo,
      };
      
      setSupportInfo(updatedSupportInfo);
      setBaseSupportInfo(updatedSupportInfo);
      
      console.log('✅ شماره تماس پشتیبانی و ایمیل پشتیبانی با موفقیت در localStorage ذخیره شدند');
      
      alert("تنظیمات با موفقیت ذخیره شد");
      
    } catch (error) {
      console.error('❌ خطا در ذخیره‌سازی:', error);
      alert("خطا در ذخیره تنظیمات. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSaving(false);
    }
  }, [companyInfo, supportInfo, isSaving]);

  // لغو تغییرات
  const handleCancel = useCallback(() => {
    // ✅ برگرداندن به مقادیر ذخیره شده در localStorage
    const savedCompany = getSavedCompanyInfo();
    const savedSupport = getSavedSupportInfo();
    
    const resetCompanyInfo: CompanyInfo = {
      name: savedCompany.name || "",
      domain: "",
      description: savedCompany.description || "",
      logo: savedCompany.logo !== undefined ? savedCompany.logo : null,
      phone: "",
      email: "",
      logoFile: null,
    };
    
    const resetSupportInfo: SupportInfo = {
      phone: savedSupport.phone || "",
      email: savedSupport.email || "",
      alertPhone: savedSupport.alertPhone || "",
      introText: savedSupport.introText || "",
    };
    
    setCompanyInfo(resetCompanyInfo);
    setBaseCompanyInfo(resetCompanyInfo);
    
    setSupportInfo(resetSupportInfo);
    setBaseSupportInfo(resetSupportInfo);
    
    setWorkingHours(initialWorkingHours);
    setNotificationSettings(initialNotificationSettings);
    setSecuritySettings(initialSecuritySettings);
    setSessions(initialSessions);
    setSetupItems(initialSetupItems);
    alert("تغییرات لغو شد");
  }, []);

  // محاسبه آمار
  const completedCount = useMemo(() => {
    return setupItems.filter(item => item.completed).length;
  }, [setupItems]);

  const totalCount = setupItems.length;

  return {
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
    smsCredit: 5420,
    smsStatus: "connected" as const,
    lastSmsSent: "۲ ساعت پیش",
    completedCount,
    totalCount,
  };
}