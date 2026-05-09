import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { HiOutlineSparkles } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { getGoogleAuthUrl } from '../api/authApi';
import LoadingSpinner from '../components/LoadingSpinner';

const RegisterPage = () => {
  const { register } = useAuth();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password !== confirmPassword) {
      const toast = (await import('react-hot-toast')).default;
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      const toast = (await import('react-hot-toast')).default;
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password);
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
            Start your
            <span className="block text-primary-400">productivity journey</span>
          </h2>
          <p className="text-dark-400 text-lg leading-relaxed">
            Create your free account and start managing tasks with your team in real-time.
          </p>
        </div>
      </div>

      {/* Right Panel — Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <HiOutlineSparkles className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-white">ProSync</h1>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
          <p className="text-dark-400 mb-8">Fill in your details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-dark-300 mb-1.5">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-dark-300 mb-1.5">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-dark-300 mb-1.5">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="input-field"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="register-confirm" className="block text-sm font-medium text-dark-300 mb-1.5">
                Confirm Password
              </label>
              <input
                id="register-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center mt-2"
              id="btn-register"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Create Account'}
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
            id="btn-google-register"
          >
            <FcGoogle className="text-xl" />
            Sign up with Google
          </a>

          <p className="text-center text-sm text-dark-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
