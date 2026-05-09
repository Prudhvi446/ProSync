import axiosInstance from './axiosInstance';

export const loginApi = async (email, password) => {
  const { data } = await axiosInstance.post('/auth/login', { email, password });
  return data;
};

export const registerApi = async (name, email, password) => {
  const { data } = await axiosInstance.post('/auth/register', { name, email, password });
  return data;
};

export const refreshTokenApi = async (refreshToken) => {
  const { data } = await axiosInstance.post('/auth/refresh', { refreshToken });
  return data;
};

export const logoutApi = async (refreshToken) => {
  const { data } = await axiosInstance.post('/auth/logout', { refreshToken });
  return data;
};

export const getMeApi = async () => {
  const { data } = await axiosInstance.get('/auth/me');
  return data;
};

export const getGoogleAuthUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return `${apiUrl}/api/auth/google`;
};
