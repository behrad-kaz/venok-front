"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ConversationsContainer from "@/components/dashboard/conversations";

export default function ConversationsPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] overflow-hidden">
        <ConversationsContainer />
      </div>
    </DashboardLayout>
  );
}