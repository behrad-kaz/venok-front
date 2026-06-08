// app/dashboard/conversations/page.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ConversationsContainer from "@/components/dashboard/conversations";

export default function ConversationsPage() {
  return (
    <DashboardLayout>
      <ConversationsContainer />
    </DashboardLayout>
  );
}