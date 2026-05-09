import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getMeApi } from '../api/authApi';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, accessToken, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const verifyAuth = async () => {
      if (accessToken && !useAuthStore.getState().user) {
        try {
          const result = await getMeApi();
          setUser(result.data.user);
        } catch (error) {
          logout();
        }
      } else {
        setLoading(false);
      }
    };
    verifyAuth();
  }, [accessToken, setUser, setLoading, logout]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-dark-400 text-sm animate-pulse-soft">Loading ProSync...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
