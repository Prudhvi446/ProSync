import { create } from 'zustand';
import { getAnalyticsApi, getAISummaryApi } from '../api/analyticsApi';
import toast from 'react-hot-toast';

export const useAnalyticsStore = create((set) => ({
  data: null,
  summary: null,
  cacheStatus: null,
  isLoading: false,
  isSummaryLoading: false,

  fetchAnalytics: async (workspaceId) => {
    set({ isLoading: true });
    try {
      const result = await getAnalyticsApi(workspaceId);
      set({
        data: result.data,
        cacheStatus: result.cacheStatus,
        isLoading: false,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch analytics');
      set({ isLoading: false });
    }
  },

  fetchSummary: async (workspaceId) => {
    set({ isSummaryLoading: true });
    try {
      const result = await getAISummaryApi(workspaceId);
      set({
        summary: result.data,
        isSummaryLoading: false,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate AI summary');
      set({ isSummaryLoading: false });
    }
  },

  clearAnalytics: () => set({ data: null, summary: null, cacheStatus: null }),
}));
