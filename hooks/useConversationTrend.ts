// hooks/useConversationTrend.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api-client';

interface TrendData {
  day: string;
  new: number;
  open: number;
  closed: number;
}

interface UseConversationTrendReturn {
  data: TrendData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const getDayName = (date: Date): string => {
  const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  return days[date.getDay()];
};

const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export function useConversationTrend(): UseConversationTrendReturn {
  const [data, setData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrend = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get<{ data: { createdAt?: string; status?: string }[] }>('/conversation');
      const conversations = response.data || [];

      const last7Days: TrendData[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = i === 0 ? 'امروز' : getDayName(date);

        last7Days.push({
          day: dayName,
          new: 0,
          open: 0,
          closed: 0,
        });
      }

      const dateToIndex = new Map<string, number>();
      last7Days.forEach((_, index) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - index));
        dateToIndex.set(formatDateKey(date), index);
      });

      conversations.forEach((conv) => {
        if (!conv.createdAt) return;

        const createdDate = new Date(conv.createdAt);
        const createdKey = formatDateKey(createdDate);
        const dayIndex = dateToIndex.get(createdKey);

        if (dayIndex === undefined) return;

        last7Days[dayIndex].new += 1;

        if (conv.status === 'open' || conv.status === 'waiting' || conv.status === 'answered') {
          last7Days[dayIndex].open += 1;
        }

        if (conv.status === 'closed') {
          last7Days[dayIndex].closed += 1;
        }
      });

      setData(last7Days);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت روند گفتگوها');
      console.error('❌ خطا در دریافت روند گفتگوها:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrend();
  }, [fetchTrend]);

  return { data, isLoading, error, refetch: fetchTrend };
}
