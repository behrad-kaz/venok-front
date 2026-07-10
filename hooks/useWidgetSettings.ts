// hooks/useWidgetSettings.ts

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useModal } from '@/components/ui/modal';
import { getCurrentWidgetConfig, updateWidgetConfig } from '@/services/widgetApi';
import { WidgetConfig, WidgetFormData, Department } from '@/components/dashboard/widget/types';

const DEFAULT_CONFIG: WidgetConfig = {
  organizationId: 0,
  workspaceId: 0,
  widgetToken: '',
  companyName: '',
  logoUrl: null,
  primaryColor: '#14b8a6',
  buttonPosition: 'bottom-right',
  buttonSize: 'md',
  formTitle: 'چطور می‌تونیم کمکتون کنیم؟',
  formDescription: 'موضوع گفتگو را انتخاب کنید تا شما را به تیم مناسب وصل کنیم.',
  phonePlaceholder: 'شماره همراه خود را وارد کنید',
  submitButtonText: 'شروع گفتگو',
  successMessage: 'لینک گفتگو برای شما پیامک شد.',
  privacyText: 'با ثبت شماره، لینک گفتگو از طریق پیامک برای شما ارسال می‌شود.',
  showDepartmentSelect: true,
  showDescriptionField: true,
  descriptionRequired: false,
  allowedDomains: [],
  isActive: true,
  departments: [],
  supportTeamIds: [],
};

export function useWidgetSettings() {
  const { showSuccess, showError, showConfirm, showInfo } = useModal();
  
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialConfig, setInitialConfig] = useState<WidgetConfig | null>(null);

  // بارگذاری تنظیمات از API
  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCurrentWidgetConfig();
      
      const mappedConfig: WidgetConfig = {
        organizationId: data.organizationId,
        workspaceId: data.workspaceId,
        widgetToken: data.widgetToken,
        companyName: data.companyName,
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        buttonPosition: data.buttonPosition,
        buttonSize: data.buttonSize,
        formTitle: data.formTitle,
        formDescription: data.formDescription,
        phonePlaceholder: data.phonePlaceholder,
        submitButtonText: data.submitButtonText,
        successMessage: data.successMessage,
        privacyText: data.privacyText,
        showDepartmentSelect: data.showDepartmentSelect,
        showDescriptionField: data.showDescriptionField,
        descriptionRequired: data.descriptionRequired,
        allowedDomains: data.allowedDomains,
        isActive: data.isActive,
        departments: data.departments,
        supportTeamIds: data.departments.map(d => d.id),
      };
      
      setConfig(mappedConfig);
      setInitialConfig(mappedConfig);
      setHasChanges(false);
      
      console.log('✅ تنظیمات ویجت بارگذاری شد:', mappedConfig);
      
    } catch (error) {
      console.error('❌ خطا در بارگذاری تنظیمات ویجت:', error);
      showError('خطا در بارگذاری تنظیمات ویجت', 'خطا');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  // بارگذاری اولیه
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // بررسی تغییرات
  const checkChanges = useCallback(() => {
    if (!initialConfig) return false;
    
    const current = {
      companyName: config.companyName,
      logoUrl: config.logoUrl,
      primaryColor: config.primaryColor,
      buttonPosition: config.buttonPosition,
      buttonSize: config.buttonSize,
      formTitle: config.formTitle,
      formDescription: config.formDescription,
      phonePlaceholder: config.phonePlaceholder,
      submitButtonText: config.submitButtonText,
      successMessage: config.successMessage,
      privacyText: config.privacyText,
      showDepartmentSelect: config.showDepartmentSelect,
      showDescriptionField: config.showDescriptionField,
      descriptionRequired: config.descriptionRequired,
      isActive: config.isActive,
      allowedDomains: config.allowedDomains,
      supportTeamIds: config.supportTeamIds,
    };
    
    const initial = {
      companyName: initialConfig.companyName,
      logoUrl: initialConfig.logoUrl,
      primaryColor: initialConfig.primaryColor,
      buttonPosition: initialConfig.buttonPosition,
      buttonSize: initialConfig.buttonSize,
      formTitle: initialConfig.formTitle,
      formDescription: initialConfig.formDescription,
      phonePlaceholder: initialConfig.phonePlaceholder,
      submitButtonText: initialConfig.submitButtonText,
      successMessage: initialConfig.successMessage,
      privacyText: initialConfig.privacyText,
      showDepartmentSelect: initialConfig.showDepartmentSelect,
      showDescriptionField: initialConfig.showDescriptionField,
      descriptionRequired: initialConfig.descriptionRequired,
      isActive: initialConfig.isActive,
      allowedDomains: initialConfig.allowedDomains,
      supportTeamIds: initialConfig.supportTeamIds,
    };
    
    const hasChanged = JSON.stringify(current) !== JSON.stringify(initial);
    setHasChanges(hasChanged);
    return hasChanged;
  }, [config, initialConfig]);

  // بررسی تغییرات در هر بار تغییر config
  useEffect(() => {
    checkChanges();
  }, [config, checkChanges]);

  // ذخیره تنظیمات
  const handleSave = useCallback(async () => {
    if (!hasChanges) {
      showInfo('هیچ تغییری برای ذخیره وجود ندارد', 'اطلاعات');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const updateData = {
        widgetToken: config.widgetToken,
        companyName: config.companyName,
        logoUrl: config.logoUrl,
        primaryColor: config.primaryColor,
        buttonPosition: config.buttonPosition,
        buttonSize: config.buttonSize,
        formTitle: config.formTitle,
        formDescription: config.formDescription,
        phonePlaceholder: config.phonePlaceholder,
        submitButtonText: config.submitButtonText,
        successMessage: config.successMessage,
        privacyText: config.privacyText,
        showDepartmentSelect: config.showDepartmentSelect,
        showDescriptionField: config.showDescriptionField,
        descriptionRequired: config.descriptionRequired,
        isActive: config.isActive,
        allowedDomains: config.allowedDomains,
        supportTeamIds: config.supportTeamIds,
      };
      
      const result = await updateWidgetConfig(updateData);
      
      // به‌روزرسانی config با داده‌های جدید
      const updatedConfig: WidgetConfig = {
        ...config,
        departments: result.departments,
      };
      
      setConfig(updatedConfig);
      setInitialConfig(updatedConfig);
      setHasChanges(false);
      
      showSuccess('تنظیمات ویجت با موفقیت ذخیره شد', 'موفقیت ✨');
      
    } catch (error) {
      console.error('❌ خطا در ذخیره تنظیمات ویجت:', error);
      showError('خطا در ذخیره تنظیمات ویجت', 'خطا');
    } finally {
      setIsSaving(false);
    }
  }, [config, hasChanges, showSuccess, showError, showInfo]);

  // لغو تغییرات
  const handleCancel = useCallback(() => {
    if (!initialConfig) return;
    
    showConfirm(
      'آیا از لغو تغییرات مطمئن هستید؟ تغییرات ذخیره‌نشده از بین خواهند رفت.',
      'تایید لغو تغییرات',
      () => {
        setConfig(initialConfig);
        setHasChanges(false);
        showInfo('تغییرات با موفقیت لغو شد', 'اطلاعات');
      }
    );
  }, [initialConfig, showConfirm, showInfo]);

  // به‌روزرسانی فیلد
  const updateField = useCallback(<K extends keyof WidgetConfig>(
    field: K,
    value: WidgetConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  }, []);

  // اضافه کردن دامنه
  const addDomain = useCallback((domain: string) => {
    if (!domain.trim()) return;
    if (config.allowedDomains.includes(domain.trim())) {
      showInfo('این دامنه قبلاً اضافه شده است', 'تکرار');
      return;
    }
    updateField('allowedDomains', [...config.allowedDomains, domain.trim()]);
  }, [config.allowedDomains, updateField, showInfo]);

  // حذف دامنه
  const removeDomain = useCallback((domain: string) => {
    updateField('allowedDomains', config.allowedDomains.filter(d => d !== domain));
  }, [config.allowedDomains, updateField]);

  // تغییر وضعیت دپارتمان
  const toggleDepartmentStatus = useCallback((departmentId: number) => {
    const dept = config.departments.find(d => d.id === departmentId);
    if (!dept) return;
    
    // فقط وضعیت را در لیست محلی تغییر می‌دهیم
    // برای ارسال به سرور، باید supportTeamIds را به‌روز کنیم
    const updatedDepartments = config.departments.map(d =>
      d.id === departmentId ? { ...d, isActive: !d.isActive } : d
    );
    
    const activeIds = updatedDepartments.filter(d => d.isActive).map(d => d.id);
    
    setConfig(prev => ({
      ...prev,
      departments: updatedDepartments,
      supportTeamIds: activeIds,
    }));
  }, [config.departments]);

  return {
    config,
    isLoading,
    isSaving,
    hasChanges,
    updateField,
    handleSave,
    handleCancel,
    loadConfig,
    addDomain,
    removeDomain,
    toggleDepartmentStatus,
  };
}