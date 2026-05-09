import axiosInstance from './axiosInstance';

export const getTasksApi = async (workspaceId, filters = {}) => {
  const params = { workspaceId, ...filters };
  const { data } = await axiosInstance.get('/tasks', { params });
  return data;
};

export const createTaskApi = async (taskData) => {
  const { data } = await axiosInstance.post('/tasks', taskData);
  return data;
};

export const updateTaskApi = async (taskId, updates) => {
  const { data } = await axiosInstance.patch(`/tasks/${taskId}`, updates);
  return data;
};

export const deleteTaskApi = async (taskId) => {
  const { data } = await axiosInstance.delete(`/tasks/${taskId}`);
  return data;
};
