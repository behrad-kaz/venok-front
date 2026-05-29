// stores/useRoleStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "مدیر کل" | "مدیر" | "کارمند";

interface RoleState {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: "مدیر کل",
      setRole: (role) => {
        set({ role });
        localStorage.setItem("userRole", role);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("roleChanged", { detail: role }));
        }
      },
    }),
    {
      name: "user-role-storage",
    }
  )
);