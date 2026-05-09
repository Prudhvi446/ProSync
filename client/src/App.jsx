import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const InvitePage = lazy(() => import('./pages/InvitePage'));
const OAuthCallbackPage = lazy(() => import('./pages/OAuthCallbackPage'));

function App() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-dark-950">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/workspace/:id/tasks" element={<TasksPage />} />
            <Route path="/workspace/:id/analytics" element={<AnalyticsPage />} />
            <Route path="/invite" element={<InvitePage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
