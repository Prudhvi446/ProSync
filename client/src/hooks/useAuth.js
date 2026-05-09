import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useTaskStore } from '../store/taskStore';
import { loginApi, registerApi, logoutApi, getMeApi } from '../api/authApi';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setAuth, setUser, setLoading, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const result = await getMeApi();
      setUser(result.data.user);
    } catch (error) {
      storeLogout();
    }
  }, [setUser, setLoading, storeLogout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const result = await loginApi(email, password);
      setAuth(result.data.user, result.data.accessToken, result.data.refreshToken);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const result = await registerApi(name, email, password);
      setAuth(result.data.user, result.data.accessToken, result.data.refreshToken);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      await logoutApi(refreshToken);
    } catch (error) {
      // Silent fail — logout locally regardless
    }
    storeLogout();
    useWorkspaceStore.getState().clearAll();
    useTaskStore.getState().clearTasks();
    toast.success('Logged out');
    navigate('/login');
  };

  return { user, isAuthenticated, isLoading, login, register, logout, checkAuth };
};
