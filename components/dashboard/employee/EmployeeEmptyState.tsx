// components/dashboard/employee/EmployeeEmptyState.tsx

"use client";

import { MessageCircle } from "lucide-react";

export default function EmployeeEmptyState() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">گفتگویی را انتخاب کنید</p>
      </div>
    </div>
  );
}