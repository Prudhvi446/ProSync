import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineUserAdd, HiOutlineClipboardList, HiOutlineLightningBolt, HiOutlineTrendingUp, HiOutlineExclamation } from 'react-icons/hi';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useTaskStore } from '../store/taskStore';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useAuthStore } from '../store/authStore';
import { getTasksApi } from '../api/taskApi';
import { useSocket } from '../hooks/useSocket';
import KanbanBoard from '../components/KanbanBoard';
import AnalyticsCard from '../components/AnalyticsCard';
import AISummaryPanel from '../components/AISummaryPanel';
import CreateTaskModal from '../components/CreateTaskModal';
import InviteMemberModal from '../components/InviteMemberModal';
import InvitationsPanel from '../components/InvitationsPanel';
import MembersPanel from '../components/MembersPanel';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeWorkspace } = useWorkspaceStore();
  const { tasks, setTasks } = useTaskStore();
  const { data: analytics, fetchAnalytics } = useAnalyticsStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(true);

  useSocket(activeWorkspace?._id);

  useEffect(() => {
    const loadData = async () => {
      if (!activeWorkspace?._id) {
        setTasksLoading(false);
        return;
      }

      setTasksLoading(true);
      try {
        const [taskResult] = await Promise.all([
          getTasksApi(activeWorkspace._id),
          fetchAnalytics(activeWorkspace._id),
        ]);
        setTasks(taskResult.data.tasks);
      } catch (error) {
        // handled by axios interceptor
      } finally {
        setTasksLoading(false);
      }
    };

    loadData();
  }, [activeWorkspace?._id, setTasks, fetchAnalytics]);

  if (!activeWorkspace) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md animate-fade-in">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center mx-auto mb-6">
            <HiOutlineClipboardList className="text-primary-400 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No workspace selected</h2>
          <p className="text-dark-400 mb-6">
            Create or select a workspace from the sidebar to get started.
          </p>
          <InvitationsPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Pending Invitations */}
      <InvitationsPanel />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-dark-400 mt-1">
            Here's what's happening in <span className="text-primary-400 font-medium">{activeWorkspace.name}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="btn-secondary flex items-center gap-2"
            id="btn-invite-member"
          >
            <HiOutlineUserAdd />
            Invite
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary flex items-center gap-2"
            id="btn-create-task"
          >
            <HiOutlinePlus />
            New Task
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnalyticsCard
          label="Total Tasks"
          value={analytics?.totalTasks ?? '—'}
          icon={<HiOutlineClipboardList />}
          color="primary"
        />
        <AnalyticsCard
          label="Completed Today"
          value={analytics?.completedToday ?? '—'}
          icon={<HiOutlineLightningBolt />}
          color="emerald"
        />
        <AnalyticsCard
          label="Completion Rate"
          value={analytics?.completionRate !== undefined ? `${analytics.completionRate}%` : '—'}
          icon={<HiOutlineTrendingUp />}
          color="amber"
        />
        <AnalyticsCard
          label="Overdue"
          value={analytics?.overdueCount ?? '—'}
          icon={<HiOutlineExclamation />}
          color="red"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Kanban Board */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Task Board</h2>
            <button
              onClick={() => navigate(`/workspace/${activeWorkspace._id}/tasks`)}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              View All →
            </button>
          </div>
          {tasksLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <KanbanBoard tasks={tasks} />
          )}
        </div>

        {/* Sidebar — AI Summary + Members */}
        <div className="lg:col-span-1 space-y-6">
          <AISummaryPanel />
          <MembersPanel />
        </div>
      </div>

      <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <InviteMemberModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
    </div>
  );
};

export default DashboardPage;
