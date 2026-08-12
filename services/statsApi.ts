// services/statsApi.ts
import { api } from './api-client';

export interface DashboardStats {
  openConversations: number;
  waitingForFirstResponse: number;
  avgResponseTime: string;
  solvedToday: number;
  changes: {
    openConversations: number;
    waitingForFirstResponse: number;
    solvedToday: number;
  };
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return api.get<DashboardStats>('/dashboard/stats');
};