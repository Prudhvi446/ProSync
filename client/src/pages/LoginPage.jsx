import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { HiOutlineSparkles } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { getGoogleAuthUrl } from '../api/authApi';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage = () => {
  const { login } = useAuth();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      // handled in useAuth
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900/40 via-dark-950 to-dark-950 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <HiOutlineSparkles className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-white">ProSync</h1>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            AI-Powered Team
            <span className="block text-primary-400">Productivity</span>
          </h2>
          <p className="text-dark-400 text-lg leading-relaxed">
            Manage tasks, collaborate in real-time, and get AI-driven insights to supercharge your team's productivity.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">Real-time</div>
              <div className="text-xs text-dark-500 mt-1">Collaboration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">AI</div>
              <div className="text-xs text-dark-500 mt-1">Summaries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">Kanban</div>
              <div className="text-xs text-dark-500 mt-1">Board</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <HiOutlineSparkles className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-white">ProSync</h1>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-dark-400 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-dark-300 mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-dark-300 mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center"
              id="btn-login"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-950 text-dark-500">or continue with</span>
            </div>
          </div>

          <a
            href={getGoogleAuthUrl()}
            className="btn-secondary w-full flex items-center justify-center gap-3"
            id="btn-google-login"
          >
            <FcGoogle className="text-xl" />
            Sign in with Google
          </a>

          <p className="text-center text-sm text-dark-400 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
