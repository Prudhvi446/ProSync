import axiosInstance from './axiosInstance';

export const getAnalyticsApi = async (workspaceId) => {
  const response = await axiosInstance.get(`/analytics/${workspaceId}`);
  const cacheStatus = response.headers['x-cache'] || 'UNKNOWN';
  return { ...response.data, cacheStatus };
};

export const getAISummaryApi = async (workspaceId) => {
  const { data } = await axiosInstance.post('/ai/summary', { workspaceId });
  return data;
};
