"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Loader2, Send } from "lucide-react";
import { Member } from "./types";

interface MemberRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  departmentName: string;
  managerName: string;
}

export default function MemberRequestModal({
  isOpen,
  onClose,
  members,
  departmentName,
  managerName,
}: MemberRequestModalProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedMember(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedMember) return;

    setIsSubmitting(true);
    try {
      const { createNotification } = await import("@/services/notificationApi");
      const { authService } = await import("@/services/auth.service");

      const workspace = authService.getCurrentWorkspace();
      const superAdminStaffId = workspace?.managerStaffId;

      if (!superAdminStaffId) {
        throw new Error("شناسه مدیر کل یافت نشد");
      }

      const memberName = `${selectedMember.firstName} ${selectedMember.lastName}`;
      const message = `مدیر کل محترم،\n\nاز شما تقاضا دارم نسبت به حذف یا تعویض دپارتمان کارمند "${memberName}" از دپارتمان "${departmentName}" اقدام فرمائید.\n\nبا تشکر،\n${managerName}`;

      await createNotification({
        title: `درخواست تغییر عضو از ${managerName}`,
        description: message,
        type: "warning",
        recipientId: superAdminStaffId,
        buttonText: "مشاهده درخواست",
        buttonLink: "/dashboard/members",
      });

      alert("درخواست شما با موفقیت برای مدیر کل ارسال شد.");
      onClose();
    } catch (error) {
      console.error("❌ خطا در ارسال درخواست:", error);
      alert("خطا در ارسال درخواست. لطفا دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              className="relative w-full max-w-md rounded-3xl bg-[rgba(9,22,18,0.98)] border border-[rgba(255,255,255,0.1)] shadow-2xl overflow-hidden"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-2xl mt-1 mr-1 flex items-center justify-center text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200 z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 sm:p-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[rgba(242,184,75,0.12)] border border-[rgba(242,184,75,0.25)]">
                    <Users className="w-8 h-8 text-[#F2B84B]" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-center mb-2 text-[#F2B84B]">
                  درخواست تغییر عضو
                </h3>
                <p className="text-sm text-gray-400 text-center mb-6">
                  انتخاب کنید که می‌خواهید درخواست تغییر برای کدام عضو ارسال شود.
                </p>

                <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
                  {members.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">هیچ عضویی در دپارتمان یافت نشد</p>
                  ) : (
                    members.map((member) => {
                      const fullName = `${member.firstName} ${member.lastName}`;
                      const isSelected = selectedMember?.id === member.id;
                      return (
                        <button
                          key={member.id}
                          onClick={() => setSelectedMember(member)}
                          className={`w-full text-right px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                            isSelected
                              ? "bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)]"
                              : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-white">{fullName}</p>
                            <p className="text-xs text-gray-500">{member.phone}</p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#59D8C3] flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-[#06110F]" />
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedMember || isSubmitting}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg hover:shadow-[#59D8C3]/25 transition-all duration-200 flex items-center justify-center gap-2 min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        ارسال درخواست
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F2B84B] via-[#59D8C3] to-[#5BE0A8] opacity-50" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
