// app/onboarding/workspace/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Building2, Users, CheckCircle } from "lucide-react";

// کامپوننت‌ها
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingSteps from "@/components/onboarding/OnboardingSteps";
import Step1CompanyInfo from "@/components/onboarding/steps/Step1CompanyInfo";
import Step2Departments from "@/components/onboarding/steps/Step2Departments";
import Step3Members from "@/components/onboarding/steps/Step3Members";
import Step4Review from "@/components/onboarding/steps/Step4Review";

// تایپ‌ها
import {
  Department,
  Member,
  CompanyData,
  Step,
} from "@/components/onboarding/types";

const steps: Step[] = [
  { id: 1, name: "اطلاعات شرکت", icon: Building2 },
  { id: 2, name: "دپارتمان‌ها", icon: Users },
  { id: 3, name: "اعضا", icon: Users },
  { id: 4, name: "مرور نهایی", icon: CheckCircle },
];

export default function WorkspaceSetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(4); 

  const [formData, setFormData] = useState<CompanyData>({
    companyName: "آژانس سفر نمونه",
    companyLogo: null,
    phone: "02112345678",
    email: "support@example.com",
    domain: "example.com",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [departments, setDepartments] = useState<Department[]>([
    { id: "1", name: "پشتیبانی", description: "", isActive: true },
    { id: "2", name: "فروش", description: "", isActive: true },
  ]);

  const [members, setMembers] = useState<Member[]>([]);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // توابع مدیریت دپارتمان
  const handleAddDepartment = (newDept: Omit<Department, "id">) => {
    if (departments.some((d) => d.name === newDept.name)) {
      alert("این دپارتمان قبلاً اضافه شده است");
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
      { id: Date.now().toString(), name, description: "", isActive: true },
    ]);
  };

  const handleRemoveDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    if (editingDepartment?.id === id) setEditingDepartment(null);
  };

  const handleToggleDepartmentStatus = (id: string) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d)),
    );
  };

  const handleEditDepartment = (dept: Department) => {
    setEditingDepartment(dept);
  };

  const handleSaveEditDepartment = (editedDept: Department) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === editedDept.id ? editedDept : d)),
    );
    setEditingDepartment(null);
  };

  const handleCancelEditDepartment = () => {
    setEditingDepartment(null);
  };

  // توابع مدیریت اعضا
  const handleAddMember = (newMember: Omit<Member, "id">) => {
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
        alert("حجم فایل باید کمتر از ۲ مگابایت باشد");
        return;
      }
      if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
        alert("فرمت فایل باید PNG یا JPG باشد");
        return;
      }
      setFormData((prev) => ({ ...prev, companyLogo: file }));
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
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

  const isStepValid = () => {
    if (currentStep === 1)
      return !!(formData.companyName && formData.phone && formData.email);
    if (currentStep === 2) return departments.length > 0;
    if (currentStep === 3) return true; // اختیاری
    return true;
  };

  const getSubtitle = () => {
    if (currentStep === 4) return "بررسی نهایی و ورود به داشبورد";
    if (currentStep === 3)
      return "اعضای تیم را اضافه کنید و به دپارتمان‌ها اختصاص دهید (اختیاری)";
    if (currentStep === 2) return "دپارتمان‌های پشتیبانی را ایجاد کنید";
    return "اطلاعات پایه workspace خود را وارد کنید";
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1CompanyInfo
            formData={formData}
            logoPreview={logoPreview}
            onInputChange={handleInputChange}
            onLogoChange={handleLogoChange}
          />
        );
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
                  ? "opacity-50 cursor-not-allowed text-gray-500"
                  : "bg-[rgba(255,255,255,0.05)] text-white hover:bg-[rgba(255,255,255,0.1)]"
              }`}
            >
              بازگشت
            </button>

            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`px-6 py-2.5 rounded-2xl text-sm font-medium transition-all flex items-center gap-2 ${
                isStepValid()
                  ? "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg hover:shadow-[#59D8C3]/25 active:scale-[0.98]"
                  : "opacity-50 cursor-not-allowed bg-[rgba(255,255,255,0.05)] text-gray-500"
              }`}
            >
              ادامه
            </button>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}