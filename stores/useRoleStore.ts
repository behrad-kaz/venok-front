import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "مدیر کل" | "مدیر" | "کارمند";

// تبدیل نقش انگلیسی به فارسی
const englishToPersianRole = (englishRole: string): UserRole => {
  switch (englishRole) {
    case "super_admin":
      return "مدیر کل";
    case "manager":
      return "مدیر";
    case "staff":
      return "کارمند";
    default:
      return "کارمند";
  }
};

// تبدیل نقش فارسی به انگلیسی
const persianToEnglishRole = (persianRole: UserRole): string => {
  switch (persianRole) {
    case "مدیر کل":
      return "super_admin";
    case "مدیر":
      return "manager";
    case "کارمند":
      return "staff";
    default:
      return "staff";
  }
};

interface RoleState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  // ✅ اضافه شده برای دریافت نقش از localStorage هنگام لود
  loadRoleFromStorage: () => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: "کارمند", // مقدار پیش‌فرض
      setRole: (role) => {
        set({ role });
        localStorage.setItem("userRole", role);
        const englishRole = persianToEnglishRole(role);
        document.cookie = `userRole=${englishRole}; path=/; max-age=${60 * 60 * 24 * 7}`;
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("roleChanged", { detail: role }));
        }
      },
      loadRoleFromStorage: () => {
        if (typeof window === "undefined") return;
        const savedRole = localStorage.getItem("userRole") as UserRole | null;
        if (savedRole && ["مدیر کل", "مدیر", "کارمند"].includes(savedRole)) {
          set({ role: savedRole });
        }
      },
    }),
    {
      name: "user-role-storage",
    }
  )
);