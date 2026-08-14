// components/dashboard/manager/MembersTable.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { api } from "@/services/api-client";
import { DepartmentMember } from "./types";

interface MembersTableProps {
  departmentId?: number | null;
  members?: DepartmentMember[];
}

const getWorkStatusBadge = (status: string) => {
  if (status === "busy") {
    return { text: "پرمشغله", color: "bg-[rgba(242,184,75,0.1)] text-[#F2B84B]" };
  }
  return { text: "عادی", color: "bg-[rgba(89,216,195,0.1)] text-[#59D8C3]" };
};

export default function MembersTable({ departmentId, members: externalMembers }: MembersTableProps) {
  const [internalMembers, setInternalMembers] = useState<DepartmentMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useExternal = Array.isArray(externalMembers);

  useEffect(() => {
    if (useExternal) return;

    const fetchMembers = async () => {
      if (!departmentId) {
        setInternalMembers([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [staffResponse, conversationsResponse] = await Promise.all([
          api.get<any[]>("/staff"),
          api.get<{ data: any[] }>("/conversation"),
        ]);

        const staffs = Array.isArray(staffResponse)
          ? staffResponse
          : staffResponse?.data || [];
        const conversations = conversationsResponse?.data || [];

        const deptStaffs = staffs.filter(
          (staff: any) =>
            staff.departmentId === departmentId &&
            staff.deletedAt === null
        );

        const deptConversations = conversations.filter(
          (conv: any) => (conv.teamId || conv.team?.id) === departmentId && conv.deletedAt === null
        );

        console.log('🔍 [MembersTable] departmentId:', departmentId);
        console.log('🔍 [MembersTable] total conversations:', conversations.length);
        console.log('🔍 [MembersTable] deptConversations:', deptConversations.length);
        console.log('🔍 [MembersTable] deptStaffs:', deptStaffs.map((s: any) => ({ id: s.id, name: s.name })));
        deptConversations.forEach((conv: any) => {
          console.log('🔍 [MembersTable] conversation:', {
            id: conv.id,
            agentId: conv.agentId,
            agentIdNested: conv.agent?.id,
            teamId: conv.teamId,
            teamIdNested: conv.team?.id,
            status: conv.status,
          });
        });

        const members: DepartmentMember[] = deptStaffs.map((staff: any) => {
          const staffConversations = deptConversations.filter(
            (conv: any) => (conv.agentId || conv.agent?.id) === staff.id && conv.status !== "closed"
          );
          const openTicketsCount = staffConversations.length;

          const closedTicketsCount = deptConversations.filter(
            (conv: any) => (conv.agentId || conv.agent?.id) === staff.id && conv.status === "closed"
          ).length;

          const staffAnswered = deptConversations.filter(
            (conv: any) => (conv.agentId || conv.agent?.id) === staff.id && (conv.status === "answered" || conv.status === "closed")
          );
          const staffAvgTime = calculateAvgResponseTime(staffAnswered);

          return {
            id: staff.id,
            name: staff.name,
            initial: staff.name.charAt(0),
            status: staff.lastOnlineAt ? "online" : "offline",
            openTickets: openTicketsCount,
            avgResponseTime: staffAvgTime,
            lastActivity: staff.lastOnlineAt ? getTimeAgo(staff.lastOnlineAt) : "نامشخص",
            workStatus: openTicketsCount > 3 ? "busy" : "normal",
            closedTickets: closedTicketsCount,
          };
        });

        setInternalMembers(members);
      } catch (err) {
        console.error("❌ خطا در دریافت اعضای دپارتمان:", err);
        setError("خطا در بارگذاری اعضا");
        setInternalMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [departmentId, useExternal]);

  const members = useExternal ? externalMembers : internalMembers;

  const calculateAvgResponseTime = (conversations: any[]): string => {
    const answeredConversations = conversations.filter((conv: any) => {
      const messages = conv.messages || [];
      return messages.some(
        (msg: any) =>
          msg.senderType === "agent" ||
          msg.senderType === "support" ||
          msg.senderType === "admin"
      );
    });

    if (answeredConversations.length === 0) {
      return "۰ دقیقه";
    }

    let totalResponseTime = 0;
    let responseCount = 0;

    answeredConversations.forEach((conv: any) => {
      const messages = conv.messages || [];
      const sortedMessages = [...messages].sort(
        (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      let lastCustomerMessage: any = null;

      for (const msg of sortedMessages) {
        if (msg.senderType === "customer") {
          lastCustomerMessage = msg;
        } else if (
          (msg.senderType === "agent" || msg.senderType === "support" || msg.senderType === "admin") &&
          lastCustomerMessage
        ) {
          const customerTime = new Date(lastCustomerMessage.createdAt).getTime();
          const agentTime = new Date(msg.createdAt).getTime();

          if (agentTime > customerTime) {
            const responseTime = agentTime - customerTime;
            totalResponseTime += responseTime;
            responseCount++;
            lastCustomerMessage = null;
          }
        }
      }
    });

    if (responseCount === 0) {
      return "۰ دقیقه";
    }

    const avgMs = totalResponseTime / responseCount;
    const avgMinutes = Math.round(avgMs / 60000);

    if (avgMinutes === 0) {
      return "کمتر از ۱ دقیقه";
    }

    return `${avgMinutes} دقیقه`;
  };

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "چند لحظه پیش";
    if (diffMins < 60) return `${diffMins} دقیقه پیش`;
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    if (diffDays < 7) return `${diffDays} روز پیش`;
    return date.toLocaleDateString("fa-IR");
  };

  return (
    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <h3 className="text-base font-bold text-white mb-4">وضعیت اعضای دپارتمان</h3>
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#59D8C3] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.1)]">
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4">عضو</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4">گفتگوهای باز</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4">میانگین پاسخ</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4">گفتگوهای بسته شده</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => {
              const workStatus = getWorkStatusBadge(member.workStatus);

              return (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-[rgba(255,255,255,0.05)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                          <span className="text-sm font-medium text-white">{member.initial}</span>
                        </div>
                        <div className={`absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-[rgba(9,22,18,0.8)] ${member.status === "online" ? "bg-[#5BE0A8]" : "bg-gray-500"}`} />
                      </div>
                      <span className="text-sm font-medium text-white">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-white">{member.openTickets}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-white">{member.avgResponseTime}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-white">{member.closedTickets ?? 0}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/dashboard/conversations?member=${member.id}`} className="text-xs text-[#59D8C3] hover:text-[#4dc7b5] transition-colors">
                      مشاهده گفتگوها
                    </Link>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!useExternal && members.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">هیچ عضوی در این دپارتمان یافت نشد</p>
        </div>
      )}
    </div>
  );
}

function calculateClosedTickets(allConversations: any[], staffId: number): number {
  return allConversations.filter(
    (conv: any) => (conv.agentId || conv.agent?.id) === staffId && conv.status === "closed"
  ).length;
}