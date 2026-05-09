import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineSearch } from 'react-icons/hi';
import { useTaskStore } from '../store/taskStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { getTasksApi } from '../api/taskApi';
import { getWorkspaceByIdApi } from '../api/workspaceApi';
import { useSocket } from '../hooks/useSocket';
import { useDebounce } from '../hooks/useDebounce';
import KanbanBoard from '../components/KanbanBoard';
import CreateTaskModal from '../components/CreateTaskModal';
import LoadingSpinner from '../components/LoadingSpinner';

const TasksPage = () => {
  const { id: workspaceId } = useParams();
  const { tasks, setTasks } = useTaskStore();
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  useSocket(workspaceId);

  useEffect(() => {
    const loadWorkspace = async () => {
      if (!activeWorkspace || activeWorkspace._id !== workspaceId) {
        try {
          const result = await getWorkspaceByIdApi(workspaceId);
          setActiveWorkspace(result.data.workspace);
        } catch (error) { /* handled */ }
      }
    };
    loadWorkspace();
  }, [workspaceId, activeWorkspace, setActiveWorkspace]);

  useEffect(() => {
    const loadTasks = async () => {
      if (!workspaceId) return;
      setIsLoading(true);
      try {
        const filters = {};
        if (debouncedSearch) filters.search = debouncedSearch;
        const result = await getTasksApi(workspaceId, filters);
        setTasks(result.data.tasks);
      } catch (error) { /* handled */ }
      finally { setIsLoading(false); }
    };
    loadTasks();
  }, [workspaceId, debouncedSearch, setTasks]);

  const filteredTasks = useMemo(() => {
    if (!filterPriority) return tasks;
    return tasks.filter((t) => t.priority === filterPriority);
  }, [tasks, filterPriority]);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-dark-400 mt-1">{activeWorkspace?.name || 'Loading...'}</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary flex items-center gap-2" id="btn-create-task-page">
          <HiOutlinePlus /> New Task
        </button>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tasks..." className="input-field pl-10" id="input-task-search" />
        </div>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="input-field w-40" id="filter-priority">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <KanbanBoard tasks={filteredTasks} />
      )}
      <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
};

export default TasksPage;
