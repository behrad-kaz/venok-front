"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { api } from "@/services/api-client";
import { authService } from "@/services/auth.service";

interface TrendData {
  day: string;
  new: number;
  open: number;
  closed: number;
}

interface ConversationTrendProps {
  data?: TrendData[];
}

export default function ConversationTrend({ data: propData }: ConversationTrendProps) {
  const [data, setData] = useState<TrendData[]>(propData || []);
  const [isLoading, setIsLoading] = useState(!propData);
  const [error, setError] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<{ day: string; type: string; value: number } | null>(null);

  const fetchTrend = useCallback(async () => {
    if (propData) return;

    try {
      setIsLoading(true);
      setError(null);

      const staffId = authService.getStaffId();
      if (!staffId) {
        console.warn("⚠️ staffId وجود ندارد");
        setIsLoading(false);
        return;
      }

      const staffResponse = await api.get<{
        id: number;
        departmentId: number | null;
      }>(`/staff/${staffId}`);

      const departmentId = staffResponse.departmentId;
      if (!departmentId) {
        console.warn("⚠️ کاربر جاری دپارتمان ندارد");
        setIsLoading(false);
        return;
      }

      const conversationsResponse = await api.get<{ data: any[] }>("/conversation");
      const conversations = conversationsResponse?.data || [];

      const deptConversations = conversations.filter(
        (conv: any) => conv.teamId === departmentId && conv.deletedAt === null
      );

      const dayNames = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
      const trend: TrendData[] = [];
      const nowDate = new Date();
      nowDate.setHours(0, 0, 0, 0);

      for (let i = 6; i >= 0; i--) {
        const date = new Date(nowDate);
        date.setDate(date.getDate() - i);
        const dayName = i === 0 ? "امروز" : dayNames[date.getDay()];
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        const dayConvs = deptConversations.filter((conv: any) => {
          if (!conv.createdAt) return false;
          const createdDate = new Date(conv.createdAt);
          const createdDateStr = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, "0")}-${String(createdDate.getDate()).padStart(2, "0")}`;
          return createdDateStr === dateKey;
        });

        const closedCount = dayConvs.filter((conv: any) => conv.status === "closed").length;

        trend.push({
          day: dayName,
          new: dayConvs.length,
          open: dayConvs.filter((c: any) => c.status !== "closed").length,
          closed: closedCount,
        });
      }

      setData(trend);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت روند گفتگوها");
      console.error("❌ خطا در دریافت روند گفتگوها:", err);
    } finally {
      setIsLoading(false);
    }
  }, [propData]);

  useEffect(() => {
    fetchTrend();
  }, [fetchTrend]);

  const maxValue = Math.max(...data.map((d) => Math.max(d.new, d.open, d.closed)), 1);
  const getBarHeight = (value: number) => (value / maxValue) * 100;

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
        <h3 className="text-sm font-bold text-white mb-4">روند گفتگوهای دپارتمان</h3>
        <div className="h-48 flex items-end justify-between gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1 h-32">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="w-full rounded-t-lg bg-[rgba(255,255,255,0.03)] animate-pulse"
                    style={{ height: `${Math.max(20, Math.random() * 80)}%` }}
                  />
                ))}
              </div>
              <div className="h-3 w-6 bg-[rgba(255,255,255,0.03)] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
        <h3 className="text-sm font-bold text-white mb-4">روند گفتگوهای دپارتمان</h3>
        <div className="h-48 flex items-center justify-center">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-5">
      <h3 className="text-sm font-bold text-white mb-4">روند گفتگوهای دپارتمان</h3>

      <div className="relative">
        <div className="h-48 flex items-end justify-between gap-2">
          {data.map((item, idx) => (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1 h-32">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${getBarHeight(item.new)}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  onMouseEnter={() => setHoveredBar({ day: item.day, type: "جدید", value: item.new })}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="w-full rounded-t-lg bg-[rgba(89,216,195,0.3)] border-t-2 border-[#59D8C3] transition-all hover:bg-[rgba(89,216,195,0.4)] cursor-pointer"
                  style={{ height: `${getBarHeight(item.new)}%` }}
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${getBarHeight(item.open)}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  onMouseEnter={() => setHoveredBar({ day: item.day, type: "باز", value: item.open })}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="w-full rounded-t-lg bg-[rgba(242,184,75,0.3)] border-t-2 border-[#F2B84B] transition-all hover:bg-[rgba(242,184,75,0.4)] cursor-pointer"
                  style={{ height: `${getBarHeight(item.open)}%` }}
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${getBarHeight(item.closed)}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  onMouseEnter={() => setHoveredBar({ day: item.day, type: "بسته", value: item.closed })}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="w-full rounded-t-lg bg-[rgba(91,224,168,0.3)] border-t-2 border-[#5BE0A8] transition-all hover:bg-[rgba(91,224,168,0.4)] cursor-pointer"
                  style={{ height: `${getBarHeight(item.closed)}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500">{item.day}</span>
            </div>
          ))}
        </div>

        {hoveredBar && (
          <div
            className="absolute bg-[#0D1B17] border border-[#59D8C3]/30 rounded-lg px-3 py-1.5 shadow-lg z-50 text-center"
            style={{
              left: "50%",
              bottom: "100%",
              transform: "translateX(-50%)",
              marginBottom: "8px",
            }}
          >
            <div className="text-[10px] text-gray-400">{hoveredBar.day}</div>
            <div className="text-xs font-bold text-[#59D8C3]">{hoveredBar.value}</div>
            <div className="text-[9px] text-gray-500">{hoveredBar.type}</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#59D8C3]" />
          <span className="text-xs text-gray-500">گفتگوهای جدید</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#F2B84B]" />
          <span className="text-xs text-gray-500">گفتگوهای باز</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#5BE0A8]" />
          <span className="text-xs text-gray-500">گفتگوهای بسته</span>
        </div>
      </div>
    </div>
  );
}
