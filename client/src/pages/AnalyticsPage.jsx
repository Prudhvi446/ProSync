import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { getWorkspaceByIdApi } from '../api/workspaceApi';
import AnalyticsCard from '../components/AnalyticsCard';
import AISummaryPanel from '../components/AISummaryPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiOutlineClipboardList, HiOutlineLightningBolt, HiOutlineTrendingUp, HiOutlineExclamation } from 'react-icons/hi';

const PIE_COLORS = ['#6366f1', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-dark-300">{label}</p>
      <p className="text-sm font-semibold text-white">{payload[0].value}</p>
    </div>
  );
};

const AnalyticsPage = () => {
  const { id: workspaceId } = useParams();
  const { data, cacheStatus, isLoading, fetchAnalytics } = useAnalyticsStore();
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();

  useEffect(() => {
    if (!activeWorkspace || activeWorkspace._id !== workspaceId) {
      getWorkspaceByIdApi(workspaceId)
        .then((r) => setActiveWorkspace(r.data.workspace))
        .catch(() => {});
    }
  }, [workspaceId, activeWorkspace, setActiveWorkspace]);

  useEffect(() => {
    if (workspaceId) fetchAnalytics(workspaceId);
  }, [workspaceId, fetchAnalytics]);

  if (isLoading || !data) {
    return <div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div>;
  }

  const priorityData = (data.tasksByPriority || []).map((p) => ({
    name: p.priority.charAt(0).toUpperCase() + p.priority.slice(1),
    value: p.count,
  }));

  const memberData = (data.tasksByMember || []).map((m) => ({
    name: m.user?.name || 'Unknown',
    completed: m.completed,
    total: m.total,
    inProgress: m.inProgress,
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-dark-400 mt-1">{activeWorkspace?.name || ''}</p>
        </div>
        {cacheStatus && (
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${cacheStatus === 'HIT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
            Cache: {cacheStatus}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnalyticsCard label="Total Tasks" value={data.totalTasks} icon={<HiOutlineClipboardList />} color="primary" />
        <AnalyticsCard label="Completed Today" value={data.completedToday} icon={<HiOutlineLightningBolt />} color="emerald" />
        <AnalyticsCard label="Completion Rate" value={`${data.completionRate}%`} icon={<HiOutlineTrendingUp />} color="amber" />
        <AnalyticsCard label="Overdue" value={data.overdueCount} icon={<HiOutlineExclamation />} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1">
          <h3 className="text-sm font-semibold text-white mb-4">Tasks by Priority</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {priorityData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-dark-500 text-center py-10">No data</p>}
          <div className="flex justify-center gap-4 mt-2">
            {priorityData.map((p, i) => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs text-dark-400">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                {p.name} ({p.value})
              </div>
            ))}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-4">Member Productivity</h3>
          {memberData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={memberData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 0, 0]} name="Completed" />
                <Bar dataKey="inProgress" fill="#3b82f6" radius={[6, 6, 0, 0]} name="In Progress" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-dark-500 text-center py-10">No member data</p>}
        </div>
      </div>

      <div className="mt-6 max-w-sm">
        <AISummaryPanel />
      </div>
    </div>
  );
};

export default AnalyticsPage;
