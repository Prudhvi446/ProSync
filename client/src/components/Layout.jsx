import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { HiOutlineViewGrid, HiOutlineChartBar, HiOutlineLogout, HiOutlineCog, HiOutlineSparkles } from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { getMyWorkspacesApi } from '../api/workspaceApi';
import { logoutApi } from '../api/authApi';
import WorkspaceSelector from './WorkspaceSelector';
import toast from 'react-hot-toast';

const Layout = () => {
  const { user, logout: storeLogout, refreshToken } = useAuthStore();
  const { workspaces, activeWorkspace, setWorkspaces } = useWorkspaceStore();
  const navigate = useNavigate();

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const result = await getMyWorkspacesApi();
        setWorkspaces(result.data.workspaces);
      } catch (error) {
        // handled by axios interceptor
      }
    };
    loadWorkspaces();
  }, [setWorkspaces]);

  const handleLogout = async () => {
    try {
      await logoutApi(refreshToken);
    } catch (error) {
      // silent
    }
    storeLogout();
    toast.success('Logged out');
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-600/10 text-primary-400 border border-primary-500/20'
        : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
    }`;

  return (
    <div className="h-screen flex bg-dark-950">
      {/* Sidebar */}
      <aside className="w-72 border-r border-dark-800/50 flex flex-col bg-dark-900/30">
        {/* Logo */}
        <div className="p-6 border-b border-dark-800/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <HiOutlineSparkles className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">ProSync</h1>
              <p className="text-xs text-dark-500">AI Productivity</p>
            </div>
          </div>
        </div>

        {/* Workspace Selector */}
        <div className="px-4 py-4 border-b border-dark-800/50">
          <WorkspaceSelector />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavLink to="/dashboard" className={navLinkClass} id="nav-dashboard">
            <HiOutlineViewGrid className="text-lg" />
            Dashboard
          </NavLink>

          {activeWorkspace && (
            <>
              <NavLink
                to={`/workspace/${activeWorkspace._id}/tasks`}
                className={navLinkClass}
                id="nav-tasks"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Tasks
              </NavLink>

              <NavLink
                to={`/workspace/${activeWorkspace._id}/analytics`}
                className={navLinkClass}
                id="nav-analytics"
              >
                <HiOutlineChartBar className="text-lg" />
                Analytics
              </NavLink>
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-dark-800/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-dark-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-dark-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
            id="btn-logout"
          >
            <HiOutlineLogout className="text-lg" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
