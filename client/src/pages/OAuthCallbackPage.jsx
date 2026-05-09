import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState(null);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('OAuth authentication failed. Please try again.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (accessToken && refreshToken) {
      setAuth(null, accessToken, refreshToken);
      navigate('/dashboard', { replace: true });
    } else {
      setError('Missing authentication tokens.');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [searchParams, navigate, setAuth]);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center animate-fade-in">
          <p className="text-red-400 mb-2">{error}</p>
          <p className="text-dark-500 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-dark-950">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-dark-400 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
