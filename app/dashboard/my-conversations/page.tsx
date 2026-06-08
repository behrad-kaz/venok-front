"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RoleGuard from "@/components/dashboard/RoleGuard";
import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard";

export default function MyConversationsPage() {
  return (
    <RoleGuard allowedRoles={["کارمند"]}>
      <DashboardLayout>
        <EmployeeDashboard />
      </DashboardLayout>
    </RoleGuard>
  );
}