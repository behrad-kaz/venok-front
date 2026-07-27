// components/onboarding/steps/Step2Departments.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, CheckCircle, Trash2, Edit2, Eye, EyeOff, Building2, Loader2 } from "lucide-react";
import { Department } from "../types";
import { 
  createTeam, 
  updateTeam, 
  deleteTeam, 
  getTeams, 
  TeamResponse,
  UpdateTeamDto
} from '@/services/teamApi';
import { useModal } from '@/components/ui/modal';

interface Step2DepartmentsProps {
  departments: Department[];
  onAddDepartment: (dept: Department) => void;
  onAddQuickDepartment: (name: string) => void;
  onRemoveDepartment: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onEditDepartment: (dept: Department) => void;
  onSaveEdit: (editedDept: Department) => void;
  onCancelEdit: () => void;
  editingDepartment: Department | null;
}

const quickDepartments = [
  "پشتیبانی",
  "فروش",
  "مالی",
  "پیگیری سفارش",
  "سایر موارد",
];

export default function Step2Departments({
  departments,
  onAddDepartment,
  onAddQuickDepartment,
  onRemoveDepartment,
  onToggleStatus,
  onEditDepartment,
  onSaveEdit,
  onCancelEdit,
  editingDepartment,
}: Step2DepartmentsProps) {
  const { showWarning, showSuccess, showError } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const [localEditingDept, setLocalEditingDept] = useState<Department | null>(null);
  const [localDepartments, setLocalDepartments] = useState<Department[]>(departments);
  
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);
  // ✅ برای جلوگیری از نمایش پیام تکراری هنگام ویرایش
  const isEditingRef = useRef(false);

  // ✅ همگام‌سازی localDepartments با props - فقط در صورت تغییر
  useEffect(() => {
    const currentIds = localDepartments.map(d => d.id).sort();
    const newIds = departments.map(d => d.id).sort();
    
    if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
      setLocalDepartments(departments);
    }
  }, [departments]);

  // ✅ بارگذاری تیم‌های موجود از سرور
  const loadTeamsFromServer = async () => {
    try {
      setIsLoading(true);
      const teams = await getTeams();
      console.log('📡 تیم‌های دریافت شده از سرور:', teams);
      
      let newDepartments: Department[] = [];
      
      if (teams && teams.length > 0) {
        const activeTeams = teams.filter(t => t.deletedAt === null);
        
        for (const team of activeTeams) {
          const exists = newDepartments.some(d => d.id === team.id);
          if (!exists) {
            newDepartments.push({
              id: team.id,
              name: team.name,
              description: team.description || '',
              isActive: team.isActive,
            });
          }
        }
      }
      
      const uniqueDepartments = newDepartments.filter((dept, index, self) => 
        index === self.findIndex(d => d.id === dept.id)
      );
      
      console.log('✅ دپارتمان‌های یکتا:', uniqueDepartments);
      
      setLocalDepartments(uniqueDepartments);
      
      for (const dept of departments) {
        onRemoveDepartment(dept.id);
      }
      for (const dept of uniqueDepartments) {
        onAddDepartment(dept);
      }
      
      hasLoadedRef.current = true;
      
    } catch (error) {
      console.error('❌ خطا در بارگذاری تیم‌ها:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ بارگذاری اولیه
  useEffect(() => {
    if (!hasLoadedRef.current && !isLoadingRef.current) {
      isLoadingRef.current = true;
      loadTeamsFromServer();
    }
  }, []);

  // ✅ پیدا کردن تیم از سرور
  const findTeam = async (dept: Department): Promise<TeamResponse | null> => {
    try {
      const teams = await getTeams();
      let found = teams.find(t => t.id === dept.id && t.deletedAt === null);
      
      if (found) {
        console.log(`✅ تیم با ID ${dept.id} پیدا شد:`, found);
        return found;
      }
      
      found = teams.find(t => t.name === dept.name && t.deletedAt === null);
      if (found) {
        console.log(`✅ تیم با نام "${dept.name}" پیدا شد با ID: ${found.id}`);
        
        const updatedDept: Department = {
          ...dept,
          id: found.id,
        };
        
        const newList = localDepartments.map(d => d.id === dept.id ? updatedDept : d);
        setLocalDepartments(newList);
        onRemoveDepartment(dept.id);
        onAddDepartment(updatedDept);
        
        return found;
      }
      
      console.warn(`⚠️ تیم "${dept.name}" (id: ${dept.id}) در سرور یافت نشد`);
      return null;
      
    } catch (error) {
      console.error('❌ خطا در پیدا کردن تیم:', error);
      return null;
    }
  };

  // ✅ ارسال دپارتمان به سرور (CREATE)
  const submitDepartmentToServer = async (name: string, description: string): Promise<TeamResponse | null> => {
    try {
      setIsSubmitting(true);
      
      const result = await createTeam({
        name: name,
        description: description,
        isActive: true,
      });
      
      console.log('✅ دپارتمان با موفقیت ایجاد شد:', result);
      
      await loadTeamsFromServer();
      
      return result;
      
    } catch (error) {
      console.error('❌ خطا در ایجاد دپارتمان:', error);
      showError('خطا در ایجاد دپارتمان. لطفاً دوباره تلاش کنید.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ به‌روزرسانی دپارتمان در سرور (UPDATE)
  const updateDepartmentOnServer = async (dept: Department): Promise<TeamResponse | null> => {
    try {
      setIsSubmitting(true);
      isEditingRef.current = true; // ✅ علامت‌گذاری شروع ویرایش
      
      let existingTeam = await findTeam(dept);
      
      if (!existingTeam) {
        const teams = await getTeams();
        existingTeam = teams.find(t => t.name === dept.name && t.deletedAt === null) || null;
        
        if (existingTeam) {
          console.log(`✅ تیم با نام "${dept.name}" پیدا شد با ID: ${existingTeam.id}`);
          
          const updatedDept: Department = {
            ...dept,
            id: existingTeam.id,
          };
          setLocalEditingDept(updatedDept);
          
          const newList = localDepartments.map(d => d.id === dept.id ? updatedDept : d);
          setLocalDepartments(newList);
          onRemoveDepartment(dept.id);
          onAddDepartment(updatedDept);
          
          dept.id = existingTeam.id;
        }
      }
      
      if (!existingTeam) {
        console.error(`❌ تیم "${dept.name}" در سرور یافت نشد`);
        await loadTeamsFromServer();
        showWarning(
          `دپارتمان "${dept.name}" در سرور وجود ندارد. لیست رفرش شد.`,
          "همگام‌سازی"
        );
        isEditingRef.current = false;
        return null;
      }
      
      const updateData: UpdateTeamDto = {
        name: dept.name,
        description: dept.description,
        isActive: dept.isActive,
      };
      
      console.log(`📤 ارسال به‌روزرسانی برای teamId: ${existingTeam.id} (نام: ${dept.name})`, updateData);
      
      const result = await updateTeam(existingTeam.id, updateData);
      console.log('✅ دپارتمان با موفقیت به‌روزرسانی شد:', result);
      
      await loadTeamsFromServer();
      
      // ✅ نمایش پیام موفقیت فقط اگر ویرایش بود نه اضافه کردن سریع
      if (isEditingRef.current) {
        showSuccess(`دپارتمان "${dept.name}" با موفقیت ویرایش شد`, "موفقیت ✨");
      }
      
      isEditingRef.current = false;
      
      return result;
      
    } catch (error) {
      console.error('❌ خطا در به‌روزرسانی دپارتمان:', error);
      showError('خطا در به‌روزرسانی دپارتمان. لطفاً دوباره تلاش کنید.');
      isEditingRef.current = false;
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ حذف دپارتمان از سرور (DELETE)
  const deleteDepartmentFromServer = async (id: number, name: string): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      
      const dept = localDepartments.find(d => d.id === id);
      if (!dept) {
        console.warn(`⚠️ دپارتمان با id ${id} در لیست محلی یافت نشد`);
        onRemoveDepartment(id);
        setLocalDepartments(prev => prev.filter(d => d.id !== id));
        return true;
      }
      
      const existingTeam = await findTeam(dept);
      
      if (!existingTeam) {
        console.warn(`⚠️ تیم "${name}" در سرور یافت نشد، حذف از UI...`);
        onRemoveDepartment(id);
        setLocalDepartments(prev => prev.filter(d => d.id !== id));
        showSuccess(`دپارتمان "${name}" با موفقیت حذف شد`);
        return true;
      }
      
      console.log(`📤 حذف تیم با ID: ${existingTeam.id} (نام: ${name})`);
      
      try {
        await deleteTeam(existingTeam.id);
        console.log(`✅ دپارتمان "${name}" با موفقیت از سرور حذف شد`);
        
        onRemoveDepartment(id);
        setLocalDepartments(prev => prev.filter(d => d.id !== id));
        
        showSuccess(`دپارتمان "${name}" با موفقیت حذف شد`);
        return true;
        
      } catch (deleteError: any) {
        console.warn(`⚠️ خطا در حذف دپارتمان "${name}" از سرور، اما حذف از UI...`);
        onRemoveDepartment(id);
        setLocalDepartments(prev => prev.filter(d => d.id !== id));
        showSuccess(`دپارتمان "${name}" با موفقیت حذف شد`);
        return true;
      }
      
    } catch (error) {
      console.error('❌ خطا در حذف دپارتمان:', error);
      showError('خطا در حذف دپارتمان. لطفاً دوباره تلاش کنید.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ تغییر وضعیت فعال/غیرفعال دپارتمان
  const toggleDepartmentStatus = async (id: number, name: string, currentStatus: boolean) => {
    try {
      setIsSubmitting(true);
      
      const dept = localDepartments.find(d => d.id === id);
      if (!dept) {
        showError('دپارتمان یافت نشد');
        return;
      }
      
      const existingTeam = await findTeam(dept);
      
      if (!existingTeam) {
        showError('امکان تغییر وضعیت دپارتمان وجود ندارد.');
        return;
      }

      const newStatus = !currentStatus;
      
      const updateData: UpdateTeamDto = {
        isActive: newStatus,
      };
      
      console.log(`📤 تغییر وضعیت تیم با ID: ${existingTeam.id} (نام: ${name}) به ${newStatus ? 'فعال' : 'غیرفعال'}`);
      
      const result = await updateTeam(existingTeam.id, updateData);
      
      if (result) {
        await loadTeamsFromServer();
        showSuccess(`دپارتمان "${name}" با موفقیت ${newStatus ? 'فعال' : 'غیرفعال'} شد`);
      }
    } catch (error) {
      console.error('❌ خطا در تغییر وضعیت دپارتمان:', error);
      showError('خطا در تغییر وضعیت دپارتمان. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.name.trim()) {
      showWarning('لطفاً نام دپارتمان را وارد کنید', 'خطا');
      return;
    }

    await submitDepartmentToServer(
      newDepartment.name.trim(),
      newDepartment.description.trim()
    );

    setNewDepartment({ name: "", description: "", isActive: true });
  };

  const handleAddQuickDepartment = async (deptName: string) => {
    // ✅ اگر در حال ویرایش هستیم، چک تکراری را انجام نده
    if (!isEditingRef.current && localDepartments.some(d => d.name === deptName)) {
      showWarning('این دپارتمان قبلاً اضافه شده است', 'تکرار');
      return;
    }

    await submitDepartmentToServer(deptName, '');
  };

  const handleSaveEdit = async () => {
    if (!localEditingDept) return;
    
    if (!localEditingDept.name.trim()) {
      showWarning('لطفاً نام دپارتمان را وارد کنید', 'خطا');
      return;
    }

    await updateDepartmentOnServer(localEditingDept);
    setLocalEditingDept(null);
    onCancelEdit();
  };

  const handleRemoveDepartment = async (id: number, name: string) => {
    await deleteDepartmentFromServer(id, name);
  };

  const handleCancelEdit = () => {
    isEditingRef.current = false;
    setLocalEditingDept(null);
    onCancelEdit();
  };

  const handleEditClick = (dept: Department) => {
    isEditingRef.current = true;
    setLocalEditingDept({ ...dept });
    onEditDepartment(dept);
  };

  const isEditing = localEditingDept !== null;

  if (isLoading && localDepartments.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#59D8C3] animate-spin" />
        <span className="mr-3 text-gray-400">در حال بارگذاری دپارتمان‌ها...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* افزودن سریع */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2">افزودن سریع</label>
        <div className="flex flex-wrap gap-2">
          {quickDepartments.map((deptName) => {
            const isAdded = localDepartments.some(d => d.name === deptName);
            return (
              <button
                key={deptName}
                onClick={() => handleAddQuickDepartment(deptName)}
                disabled={isAdded || isSubmitting}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 ${
                  isAdded || isSubmitting
                    ? "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.1)] text-gray-500 cursor-not-allowed opacity-50"
                    : "bg-[rgba(89,216,195,0.08)] border-[rgba(89,216,195,0.2)] text-[#59D8C3] hover:bg-[rgba(89,216,195,0.12)]"
                }`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : !isAdded ? (
                  <Plus className="w-3 h-3" />
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
                {deptName}
              </button>
            );
          })}
        </div>
      </div>

      {/* فرم افزودن یا ویرایش دپارتمان */}
      {!isEditing ? (
        <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
          <h4 className="text-sm font-semibold text-white mb-4">افزودن دپارتمان جدید</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                نام دپارتمان <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                placeholder="مثال: پشتیبانی فنی"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">توضیح کوتاه</label>
              <input
                type="text"
                value={newDepartment.description}
                onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                placeholder="توضیحات اختیاری"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newDepartment.isActive}
                onChange={(e) => setNewDepartment({ ...newDepartment, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] checked:bg-[#59D8C3] checked:border-[#59D8C3]"
                disabled={isSubmitting}
              />
              <span className="text-xs text-gray-400">فعال</span>
            </label>
            <button
              onClick={handleAddDepartment}
              disabled={isSubmitting}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  در حال ارسال...
                </>
              ) : (
                'افزودن'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
          <h4 className="text-sm font-semibold text-white mb-4">ویرایش دپارتمان</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                نام دپارتمان <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={localEditingDept?.name || ""}
                onChange={(e) => setLocalEditingDept(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">توضیح کوتاه</label>
              <input
                type="text"
                value={localEditingDept?.description || ""}
                onChange={(e) => setLocalEditingDept(prev => prev ? { ...prev, description: e.target.value } : null)}
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localEditingDept?.isActive || false}
                onChange={(e) => setLocalEditingDept(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                className="w-4 h-4 rounded border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] checked:bg-[#59D8C3]"
                disabled={isSubmitting}
              />
              <span className="text-xs text-gray-400">فعال</span>
            </label>
            <div className="flex gap-2">
              <button 
                onClick={handleCancelEdit} 
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
                disabled={isSubmitting}
              >
                انصراف
              </button>
              <button 
                onClick={handleSaveEdit} 
                disabled={isSubmitting}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                  isSubmitting
                    ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  'ذخیره تغییرات'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ لیست دپارتمان‌ها */}
      <div className="space-y-3">
        {localDepartments.map((dept, index) => (
          <div 
            key={`dept-${dept.id}-${index}`} 
            className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(89,216,195,0.3)] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="text-sm font-semibold text-white">{dept.name}</h5>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${dept.isActive ? "bg-[rgba(91,224,168,0.1)] text-green-400" : "bg-[rgba(255,107,107,0.1)] text-red-400"}`}>
                    {dept.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </div>
                {dept.description && <p className="text-xs text-gray-500">{dept.description}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => toggleDepartmentStatus(dept.id, dept.name, dept.isActive)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all" 
                  title={dept.isActive ? "غیرفعال کردن" : "فعال کردن"}
                  disabled={isSubmitting}
                >
                  {dept.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => handleEditClick(dept)} 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all" 
                  title="ویرایش"
                  disabled={isSubmitting}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleRemoveDepartment(dept.id, dept.name)} 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-[rgba(255,107,107,0.08)] transition-all" 
                  title="حذف"
                  disabled={isSubmitting}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {localDepartments.length === 0 && (
        <div className="p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-dashed text-center">
          <Building2 className="w-8 h-8 mx-auto mb-3 text-gray-500" />
          <p className="text-sm text-gray-400 mb-1">هنوز دپارتمانی اضافه نشده</p>
          <p className="text-xs text-gray-500">از افزودن سریع استفاده کنید یا دپارتمان دلخواه خود را ایجاد کنید.</p>
        </div>
      )}
    </div>
  );
}