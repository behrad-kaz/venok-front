// app/onboarding/workspace/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Building2, Users, CheckCircle } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// کامپوننت‌ها
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import OnboardingSteps from '@/components/onboarding/OnboardingSteps';
import Step1CompanyInfo, { Step1CompanyInfoRef } from '@/components/onboarding/steps/Step1CompanyInfo';
import Step2Departments from '@/components/onboarding/steps/Step2Departments';
import Step3Members from '@/components/onboarding/steps/Step3Members';
import Step4Review from '@/components/onboarding/steps/Step4Review';
import { useOnboarding } from '@/hooks/useOnboarding';

// تایپ‌ها
import {
  Department,
  Member,
  CompanyData,
  Step,
} from '@/components/onboarding/types';

const steps: Step[] = [
  { id: 1, name: 'اطلاعات شرکت', icon: Building2 },
  { id: 2, name: 'دپارتمان‌ها', icon: Users },
  { id: 3, name: 'اعضا', icon: Users },
  { id: 4, name: 'مرور نهایی', icon: CheckCircle },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

function WorkspaceSetupContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const step1Ref = useRef<Step1CompanyInfoRef>(null);
  const { isSaving, handleSaveAll } = useOnboarding();

  const [formData, setFormData] = useState<CompanyData>({
    companyName: '',
    companyLogo: null,
    phone: '',
    email: '',
    domain: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // توابع مدیریت دپارتمان
  const handleAddDepartment = (newDept: Omit<Department, 'id'>) => {
    if (departments.some((d) => d.name === newDept.name)) {
      alert('این دپارتمان قبلاً اضافه شده است');
      return;
    }
    setDepartments((prev) => [
      ...prev,
      { ...newDept, id: Date.now().toString() },
    ]);
  };

  const handleAddQuickDepartment = (name: string) => {
    if (departments.some((d) => d.name === name)) return;
    setDepartments((prev) => [
      ...prev,
      { id: Date.now().toString(), name, description: '', isActive: true },
    ]);
  };

  const handleRemoveDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    if (editingDepartment?.id === id) setEditingDepartment(null);
  };

  const handleToggleDepartmentStatus = (id: string) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d))
    );
  };

  const handleEditDepartment = (dept: Department) => {
    setEditingDepartment(dept);
  };

  const handleSaveEditDepartment = (editedDept: Department) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === editedDept.id ? editedDept : d))
    );
    setEditingDepartment(null);
  };

  const handleCancelEditDepartment = () => {
    setEditingDepartment(null);
  };

  // توابع مدیریت اعضا
  const handleAddMember = (newMember: Omit<Member, 'id'>) => {
    setMembers((prev) => [
      ...prev,
      { ...newMember, id: Date.now().toString() },
    ]);
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // توابع عمومی
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم فایل باید کمتر از ۲ مگابایت باشد');
        return;
      }
      if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
        alert('فرمت فایل باید PNG یا JPG باشد');
        return;
      }
      setFormData((prev) => ({ ...prev, companyLogo: file }));
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // تابع ذخیره همه اطلاعات
  const handleSaveAllWrapper = async () => {
    console.log('🔵 دکمه ادامه کلیک شد - شروع فرآیند ذخیره‌سازی');
    
    try {
      if (step1Ref.current) {
        console.log('📞 فراخوانی handleSaveAll از Step1CompanyInfo...');
        await step1Ref.current.handleSaveAll();
        console.log('✅ فرآیند ذخیره‌سازی با موفقیت انجام شد');
        handleNext();
      } else {
        console.warn('⚠️ ref به Step1CompanyInfo در دسترس نیست');
        handleNext();
      }
    } catch (error) {
      console.error('❌ خطا در ذخیره اطلاعات:', error);
      alert('خطا در ذخیره اطلاعات. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      console.log(`📌 رفتن به مرحله ${currentStep + 1}`);
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // تغییر: فیلدهای مرحله 1 اختیاری هستند
  const isStepValid = () => {
    if (currentStep === 1) {
      // فیلدهای اطلاعات شرکت اختیاری هستند
      return true;
    }
    if (currentStep === 2) return departments.length > 0;
    if (currentStep === 3) return true;
    return true;
  };

  const getSubtitle = () => {
    if (currentStep === 4) return 'بررسی نهایی و ورود به داشبورد';
    if (currentStep === 3)
      return 'اعضای تیم را اضافه کنید و به دپارتمان‌ها اختصاص دهید (اختیاری)';
    if (currentStep === 2) return 'دپارتمان‌های پشتیبانی را ایجاد کنید';
    return 'اطلاعات پایه workspace خود را وارد کنید (اختیاری)';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1CompanyInfo ref={step1Ref} />;
      case 2:
        return (
          <Step2Departments
            departments={departments}
            onAddDepartment={handleAddDepartment}
            onAddQuickDepartment={handleAddQuickDepartment}
            onRemoveDepartment={handleRemoveDepartment}
            onToggleStatus={handleToggleDepartmentStatus}
            onEditDepartment={handleEditDepartment}
            onSaveEdit={handleSaveEditDepartment}
            onCancelEdit={handleCancelEditDepartment}
            editingDepartment={editingDepartment}
          />
        );
      case 3:
        return (
          <Step3Members
            members={members}
            departments={departments}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
        );
      case 4:
        return (
          <Step4Review
            formData={formData}
            departments={departments}
            members={members}
            logoPreview={logoPreview}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout title="راه‌اندازی Workspace" subtitle={getSubtitle()}>
      <OnboardingSteps steps={steps} currentStep={currentStep} />

      <div className="p-6 lg:p-8 rounded-2xl bg-[rgba(9,22,18,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)]">
        {renderStepContent()}

        {/* فوتر - فقط برای مراحل 1 تا 3 نمایش داده شود */}
        {currentStep !== 4 && (
          <div className="flex justify-between pt-4 mt-4 border-t border-[rgba(255,255,255,0.1)]">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-2.5 rounded-2xl text-sm font-medium transition-all flex items-center gap-2 ${
                currentStep === 1
                  ? 'opacity-50 cursor-not-allowed text-gray-500'
                  : 'bg-[rgba(255,255,255,0.05)] text-white hover:bg-[rgba(255,255,255,0.1)]'
              }`}
            >
              بازگشت
            </button>

            <button
              onClick={handleSaveAllWrapper}
              disabled={!isStepValid() || isSaving}
              className={`px-6 py-2.5 rounded-2xl text-sm font-medium transition-all flex items-center gap-2 ${
                isStepValid() && !isSaving
                  ? 'bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg hover:shadow-[#59D8C3]/25 active:scale-[0.98]'
                  : 'opacity-50 cursor-not-allowed bg-[rgba(255,255,255,0.05)] text-gray-500'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                'ادامه'
              )}
            </button>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}

export default function WorkspaceSetupPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <WorkspaceSetupContent />
    </QueryClientProvider>
  );
}