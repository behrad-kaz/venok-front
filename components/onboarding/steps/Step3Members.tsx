// components/onboarding/steps/Step3Members.tsx

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Trash2,
  UserPlus,
  AlertTriangle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Member, Department } from "../types";
import { useModal } from "@/components/ui/modal";
import {
  createStaff,
  deleteStaff,
  fetchStaffList,
  StaffResponse,
} from "@/services/membersApi";
import { getTeams } from "@/services/teamApi";

interface Step3MembersProps {
  members: Member[];
  departments: Department[];
  onAddMember: (member: Omit<Member, "id">) => void;
  onRemoveMember: (id: string) => void;
  onLoadMembers?: (members: Member[]) => void;
}

// ✅ تابع تولید code یکتا
const generateUniqueCode = (phone: string): string => {
  const phonePrefix = phone.replace(/\D/g, "").substring(0, 3) || "123";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 900 + 100).toString();
  return `EMP-${phonePrefix}${timestamp}${random}`;
};

// ✅ تبدیل StaffResponse به Member با بررسی وجود دپارتمان
const mapStaffToMember = (
  staff: StaffResponse,
  departments: Department[],
): Member | null => {
  if (!staff.isActive || staff.deletedAt) {
    return null;
  }

  const nameParts = staff.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  let departmentId = "";
  let departmentName = "";
  let role: "manager" | "staff" = "staff";

  const departmentExists = staff.departmentId
    ? departments.some((d) => d.id === staff.departmentId?.toString())
    : false;

  if (staff.departmentId && departmentExists && staff.department) {
    departmentId = staff.departmentId.toString();
    departmentName = staff.department.name;
  } else {
    departmentName = "بدون دپارتمان";
    departmentId = "";
  }

  if (staff.role === "department_manager") {
    role = "manager";
  }

  return {
    id: staff.id.toString(),
    firstName,
    lastName,
    username: `user${staff.id}`,
    phone: staff.phone || "",
    password: "",
    departmentId: departmentId,
    departmentName: departmentName,
    role: role,
    status: staff.isActive ? "active" : "inactive",
    presence: staff.lastOnlineAt ? "online" : "offline",
    lastActivity: staff.lastOnlineAt ? "آنلاین" : "آفلاین",
    openTickets: 0,
  };
};

export default function Step3Members({
  members,
  departments: propsDepartments,
  onAddMember,
  onRemoveMember,
  onLoadMembers,
}: Step3MembersProps) {
  const { showWarning, showError, showSuccess, showConfirm } = useModal();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [staffIdMap, setStaffIdMap] = useState<Map<string, number>>(new Map());
  const [localMembers, setLocalMembers] = useState<Member[]>(members);
  const [localDepartments, setLocalDepartments] =
    useState<Department[]>(propsDepartments);

  const isDeletingRef = useRef<Set<string>>(new Set());

  const [newMember, setNewMember] = useState({
    fullName: "",
    phone: "",
    password: "",
    departmentId: "",
    role: "staff" as "manager" | "staff",
  });

  // ✅ همگام‌سازی localDepartments با props
  useEffect(() => {
    setLocalDepartments(propsDepartments);
  }, [propsDepartments]);

  // ✅ همگام‌سازی localMembers با props و به‌روزرسانی departmentName
  useEffect(() => {
    const updatedMembers = members.map((member) => {
      const departmentExists = member.departmentId
        ? localDepartments.some((d) => d.id === member.departmentId)
        : false;

      if (member.departmentId && !departmentExists) {
        return {
          ...member,
          departmentName: "بدون دپارتمان",
        };
      }
      return member;
    });

    setLocalMembers(updatedMembers);
  }, [members, localDepartments]);

  const departmentsWithoutManager = useMemo(() => {
    const departmentsWithManager = localMembers
      .filter((m) => m.role === "manager")
      .map((m) => m.departmentId);

    return localDepartments.filter(
      (dept) => !departmentsWithManager.includes(dept.id),
    );
  }, [localDepartments, localMembers]);

  // ✅ بارگذاری اعضای موجود از سرور و همگام‌سازی دپارتمان‌ها
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 شروع بارگذاری اطلاعات از سرور...");

        const teams = await getTeams();
        const activeTeams = teams.filter((t) => t.deletedAt === null);

        const syncedDepartments: Department[] = activeTeams.map((team) => ({
          id: team.id.toString(),
          name: team.name,
          description: team.description || "",
          isActive: team.isActive,
        }));

        setLocalDepartments(syncedDepartments);
        console.log("✅ دپارتمان‌های همگام‌سازی شده:", syncedDepartments);

        const staffList = await fetchStaffList();
        console.log(`✅ ${staffList.length} Staff دریافت شد`);

        const staffMap = new Map<string, number>();
        const loadedMembers: Member[] = [];

        for (const staff of staffList) {
          const member = mapStaffToMember(staff, syncedDepartments);
          if (member) {
            staffMap.set(staff.id.toString(), staff.id);
            loadedMembers.push(member);
          }
        }

        setStaffIdMap(staffMap);
        console.log("✅ staffIdMap:", staffMap);

        if (onLoadMembers && loadedMembers.length > 0) {
          console.log(`✅ ${loadedMembers.length} عضو بارگذاری شد`);
          onLoadMembers(loadedMembers);
          setLocalMembers(loadedMembers);
        }
      } catch (error) {
        console.error("❌ خطا در دریافت اطلاعات:", error);
        showError("خطا در بارگذاری اطلاعات اعضا", "خطا");
      } finally {
        setIsLoading(false);
        console.log("🔄 بارگذاری اطلاعات کامل شد");
      }
    };

    if (localMembers.length === 0) {
      loadExistingData();
    }
  }, [onLoadMembers, localMembers.length, showError]);

  const handleSubmit = async () => {
    console.log("📝 شروع فرآیند افزودن عضو جدید...");

    if (
      !newMember.fullName ||
      !newMember.phone ||
      !newMember.password ||
      !newMember.departmentId
    ) {
      console.warn("⚠️ فیلدهای اجباری پر نشده‌اند");
      showWarning("لطفاً تمام فیلدهای الزامی را پر کنید");
      return;
    }

    // ✅ اعتبارسنجی رمز عبور
    if (newMember.password.length < 8) {
      console.warn("⚠️ رمز عبور کمتر از ۸ کاراکتر");
      showWarning("رمز عبور باید حداقل ۸ کاراکتر باشد");
      return;
    }

    setIsSubmitting(true);
    console.log("🔄 شروع ارسال درخواست...");

    try {
      const selectedDept = localDepartments.find(
        (d) => d.id === newMember.departmentId,
      );

      if (!selectedDept) {
        console.error("❌ دپارتمان انتخاب شده یافت نشد");
        throw new Error("دپارتمان انتخاب شده یافت نشد");
      }
      console.log(
        `📌 دپارتمان انتخاب شده: ${selectedDept.name} (${selectedDept.id})`,
      );

      const departmentIdNumber = parseInt(selectedDept.id, 10);

      if (
        isNaN(departmentIdNumber) ||
        departmentIdNumber <= 0 ||
        departmentIdNumber > 2147483647
      ) {
        console.error(`❌ departmentId نامعتبر: ${selectedDept.id}`);
        throw new Error("شناسه دپارتمان نامعتبر است");
      }

      console.log(`📌 departmentId نهایی: ${departmentIdNumber}`);

      const code = generateUniqueCode(newMember.phone);

      // ✅ ایجاد Staff با داده‌های کامل - رمز عبور را حتماً ارسال کن
      const staffResult = await createStaff({
        name: newMember.fullName,
        code: code,
        phone: newMember.phone,
        password: newMember.password, // ✅ رمز عبور باید ارسال شود
        email: "",
        departmentId: departmentIdNumber,
        role: newMember.role === "manager" ? "department_manager" : "staff",
        isActive: true,
      });

      console.log(`✅ Staff ایجاد شد با id: ${staffResult.id}`);

      const staffId = staffResult.id;

      setStaffIdMap((prev) => new Map(prev).set(staffId.toString(), staffId));

      const nameParts = newMember.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const autoUsername = newMember.fullName
        .toLowerCase()
        .replace(/\s/g, "")
        .replace(/[^a-zA-Z0-9]/g, "");

      const tempId = staffId.toString();

      const newMemberData = {
        id: tempId,
        firstName: firstName,
        lastName: lastName,
        username: autoUsername || `user${tempId}`,
        phone: newMember.phone,
        password: newMember.password,
        departmentId: selectedDept.id,
        departmentName: selectedDept.name,
        role: newMember.role,
        status: "active" as const,
        presence: "offline" as const,
        lastActivity: "همین الان",
        openTickets: 0,
      };

      onAddMember(newMemberData);
      setLocalMembers((prev) => [...prev, newMemberData as Member]);

      showSuccess(
        `عضو "${newMember.fullName}" با موفقیت اضافه شد`,
        "موفقیت ✨",
      );

      setNewMember({
        fullName: "",
        phone: "",
        password: "",
        departmentId: "",
        role: "staff",
      });
      setShowForm(false);

      console.log("✅ فرآیند افزودن عضو با موفقیت کامل شد");
    } catch (error) {
      console.error("❌ خطا در افزودن عضو:", error);
      showError(
        error instanceof Error ? error.message : "خطا در افزودن عضو",
        "خطا",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // components/onboarding/steps/Step3Members.tsx
  // فقط بخش handleRemoveMember اصلاح شده است

  // ✅ تابع حذف عضو - با حذف فوری از UI
  const handleRemoveMember = async (id: string) => {
    const memberToRemove = localMembers.find((m) => m.id === id);
    if (!memberToRemove) {
      console.log(`⚠️ عضو با id ${id} قبلاً حذف شده است`);
      return;
    }

    if (isDeletingRef.current.has(id)) {
      console.log(`⏳ حذف عضو ${id} در حال انجام است، صرف نظر...`);
      return;
    }

    console.log(`🗑️ شروع فرآیند حذف عضو با id: ${id}`);

    const fullName =
      `${memberToRemove.firstName || ""} ${memberToRemove.lastName || ""}`.trim() ||
      memberToRemove.username;
    console.log(`📌 عضو مورد نظر: ${fullName}`);

    isDeletingRef.current.add(id);

    showConfirm(
      `آیا از حذف "${fullName}" از تیم مطمئن هستید؟`,
      "تایید حذف",
      async () => {
        try {
          let staffId = staffIdMap.get(id);

          console.log(`🔍 staffId از map: ${staffId}`);

          if (!staffId) {
            console.warn(
              `⚠️ staffId برای memberId ${id} در map یافت نشد، استفاده از id`,
            );
            staffId = parseInt(id);
          }

          // ✅ حذف از سرور (خطاها در خود تابع مدیریت می‌شوند)
          await deleteStaff(staffId);

          // ✅ حذف از mapping
          setStaffIdMap((prev) => {
            const newMap = new Map(prev);
            newMap.delete(id);
            return newMap;
          });

          // ✅ حذف از لیست members (والد)
          console.log(`🗑️ حذف عضو ${id} از لیست members (والد)`);
          onRemoveMember(id);
          setLocalMembers((prev) => prev.filter((m) => m.id !== id));

          isDeletingRef.current.delete(id);

          showSuccess(`عضو "${fullName}" با موفقیت حذف شد`, "موفقیت ✨");
          console.log(`✅ عضو "${fullName}" با موفقیت حذف شد`);
        } catch (error) {
          console.error("❌ خطا در حذف عضو:", error);
          // ✅ در صورت خطا، باز هم از UI حذف کن
          setStaffIdMap((prev) => {
            const newMap = new Map(prev);
            newMap.delete(id);
            return newMap;
          });
          onRemoveMember(id);
          setLocalMembers((prev) => prev.filter((m) => m.id !== id));
          isDeletingRef.current.delete(id);
          showSuccess(`عضو "${fullName}" با موفقیت حذف شد`, "موفقیت ✨");
        }
      },
      () => {
        // ✅ در صورت انصراف کاربر، از set حذف کن
        isDeletingRef.current.delete(id);
      },
    );
  };

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return `${first}${last}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#59D8C3] animate-spin" />
        <span className="mr-3 text-gray-400">در حال بارگذاری اطلاعات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {departmentsWithoutManager.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(242,184,75,0.08)] border border-[rgba(242,184,75,0.2)]">
          <AlertTriangle className="w-4 h-4 text-[#f2b84b] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-white mb-1">
              توجه: دپارتمان‌های بدون مدیر
            </p>
            <p className="text-xs text-gray-400">
              دپارتمان‌های زیر مدیر ندارند:{" "}
              {departmentsWithoutManager.map((d) => d.name).join("، ")}
            </p>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full p-4 rounded-xl border-2 border-dashed border-[rgba(255,255,255,0.1)] hover:border-[#59D8C3] hover:bg-[rgba(89,216,195,0.04)] transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-[#59D8C3]"
        >
          <UserPlus className="w-4 h-4" />
          افزودن عضو جدید
        </button>
      )}

      {showForm && (
        <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
          <h4 className="text-sm font-semibold text-white mb-4">
            افزودن عضو جدید
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                نام و نام خانوادگی <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={newMember.fullName}
                onChange={(e) =>
                  setNewMember({ ...newMember, fullName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                placeholder="مثال: علی محمدی"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                شماره همراه <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={newMember.phone}
                onChange={(e) =>
                  setNewMember({ ...newMember, phone: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                رمز عبور اولیه <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={newMember.password}
                onChange={(e) =>
                  setNewMember({ ...newMember, password: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                placeholder="حداقل ۸ کاراکتر"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                دپارتمان <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={newMember.departmentId}
                  onChange={(e) =>
                    setNewMember({ ...newMember, departmentId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white focus:outline-none focus:border-[#59D8C3] transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="text-gray-500">
                    انتخاب کنید
                  </option>
                  {localDepartments.map((dept) => (
                    <option
                      key={`dept-${dept.id}`}
                      value={dept.id}
                      className="text-white bg-[#0D1B17]"
                    >
                      {dept.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-2">
                نقش در دپارتمان <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3">
                <label
                  className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors flex-1 ${newMember.role === "manager" ? "border-[#59D8C3] bg-[rgba(89,216,195,0.05)]" : "border-[rgba(255,255,255,0.1)]"}`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={newMember.role === "manager"}
                    onChange={() =>
                      setNewMember({ ...newMember, role: "manager" })
                    }
                    className="w-4 h-4 text-[#59D8C3]"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      مدیر دپارتمان
                    </p>
                    <p className="text-xs text-gray-500">
                      دسترسی مدیریت و نظارت
                    </p>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors flex-1 ${newMember.role === "staff" ? "border-[#59D8C3] bg-[rgba(89,216,195,0.05)]" : "border-[rgba(255,255,255,0.1)]"}`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={newMember.role === "staff"}
                    onChange={() =>
                      setNewMember({ ...newMember, role: "staff" })
                    }
                    className="w-4 h-4 text-[#59D8C3]"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      کارمند پشتیبانی
                    </p>
                    <p className="text-xs text-gray-500">پاسخگویی به تیکت‌ها</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
            >
              انصراف
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  در حال افزودن...
                </>
              ) : (
                "افزودن عضو"
              )}
            </button>
          </div>
        </div>
      )}

      {localMembers.length > 0 && (
        <div className="space-y-3">
          {localMembers.map((member) => {
            const realStaffId =
              staffIdMap.get(member.id) || parseInt(member.id);

            return (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(89,216,195,0.3)] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="relative flex-shrink-0">
                      <div className="rounded-xl inline-flex items-center justify-center font-semibold bg-[rgba(89,216,195,0.14)] text-[#59D8C3] border border-[rgba(89,216,195,0.2)] w-9 h-9 text-xs">
                        {getInitials(member.firstName, member.lastName)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-semibold text-white">
                        {member.firstName} {member.lastName}
                      </h5>
                      <p className="text-xs text-gray-500" dir="ltr">
                        @{member.username} (Staff ID: {realStaffId})
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            member.role === "manager"
                              ? "bg-[rgba(89,216,195,0.1)] text-[#59D8C3] border-[rgba(89,216,195,0.2)]"
                              : "bg-[rgba(255,255,255,0.05)] text-gray-400 border-[rgba(255,255,255,0.1)]"
                          }`}
                        >
                          {member.role === "manager"
                            ? "مدیر دپارتمان"
                            : "کارمند پشتیبانی"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(255,255,255,0.05)] text-gray-400 border border-[rgba(255,255,255,0.1)]">
                          {member.departmentName || "بدون دپارتمان"}
                        </span>
                        <span className="text-[10px] text-gray-500" dir="ltr">
                          {member.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-[rgba(255,107,107,0.08)] transition-colors flex-shrink-0"
                    title="حذف عضو"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {localMembers.length === 0 && (
        <div className="p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-dashed border-[rgba(255,255,255,0.1)] text-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto mb-3 text-gray-500"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p className="text-sm text-gray-400 mb-1">هنوز عضوی اضافه نشده</p>
          <p className="text-xs text-gray-500">
            اعضای تیم پشتیبانی خود را اضافه کنید.
          </p>
        </div>
      )}
    </div>
  );
}
