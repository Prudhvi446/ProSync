import React, { useState } from 'react';
import { HiChevronDown, HiPlus, HiCheck } from 'react-icons/hi';
import { useWorkspaceStore } from '../store/workspaceStore';
import { createWorkspaceApi } from '../api/workspaceApi';
import toast from 'react-hot-toast';

const WorkspaceSelector = () => {
  const { workspaces, activeWorkspace, setActiveWorkspace, addWorkspace } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (workspace) => {
    setActiveWorkspace(workspace);
    setIsOpen(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await createWorkspaceApi(newName.trim());
      addWorkspace(result.data.workspace);
      setActiveWorkspace(result.data.workspace);
      setNewName('');
      setIsCreating(false);
      toast.success('Workspace created!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-dark-800/50 border border-dark-700/50 hover:border-dark-600 transition-all duration-200 text-left"
        id="workspace-selector"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {activeWorkspace?.name?.charAt(0)?.toUpperCase() || 'W'}
          </div>
          <span className="text-sm text-white truncate">
            {activeWorkspace?.name || 'Select workspace'}
          </span>
        </div>
        <HiChevronDown className={`text-dark-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-700/50 rounded-xl shadow-2xl shadow-black/20 z-50 overflow-hidden animate-scale-in">
          <div className="max-h-48 overflow-y-auto py-1">
            {workspaces.map((ws) => (
              <button
                key={ws._id}
                onClick={() => handleSelect(ws)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-dark-700/50 transition-colors duration-150 text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-6 w-6 rounded-md bg-primary-600/20 flex items-center justify-center text-primary-400 text-xs font-bold flex-shrink-0">
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-dark-200 truncate">{ws.name}</span>
                </div>
                {activeWorkspace?._id === ws._id && (
                  <HiCheck className="text-primary-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-dark-700/50 p-2">
            {isCreating ? (
              <form onSubmit={handleCreate} className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Workspace name..."
                  className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newName.trim()}
                  className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? '...' : 'Add'}
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-400 hover:text-primary-400 hover:bg-primary-500/5 transition-all duration-150"
              >
                <HiPlus className="text-lg" />
                New Workspace
              </button>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => { setIsOpen(false); setIsCreating(false); }} />
      )}
    </div>
  );
};

export default WorkspaceSelector;
