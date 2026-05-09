import React, { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import { createTaskApi } from '../api/taskApi';
import { getWorkspaceMembersApi } from '../api/workspaceApi';
import { useWorkspaceStore } from '../store/workspaceStore';
import toast from 'react-hot-toast';

const CreateTaskModal = ({ isOpen, onClose }) => {
  const { activeWorkspace } = useWorkspaceStore();
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    assignee: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!isOpen || !activeWorkspace?._id) return;
      try {
        const result = await getWorkspaceMembersApi(activeWorkspace._id);
        setMembers(result.data.members);
      } catch (error) {
        // fall back to activeWorkspace members
        setMembers(activeWorkspace?.members || []);
      }
    };
    fetchMembers();
  }, [isOpen, activeWorkspace?._id]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !activeWorkspace || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        workspaceId: activeWorkspace._id,
        dueDate: formData.dueDate || null,
        assignee: formData.assignee || null,
      };

      await createTaskApi(payload);
      toast.success('Task created!');
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        assignee: '',
      });
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-dark-800 border border-dark-700/50 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Create Task</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-dark-300 mb-1.5">
              Title *
            </label>
            <input
              id="task-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-dark-300 mb-1.5">
              Description
            </label>
            <textarea
              id="task-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add more details..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium text-dark-300 mb-1.5">
                Priority
              </label>
              <select
                id="task-priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-status" className="block text-sm font-medium text-dark-300 mb-1.5">
                Status
              </label>
              <select
                id="task-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-due" className="block text-sm font-medium text-dark-300 mb-1.5">
                Due Date
              </label>
              <input
                id="task-due"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="task-assignee" className="block text-sm font-medium text-dark-300 mb-1.5">
                Assignee
              </label>
              <select
                id="task-assignee"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Unassigned</option>
                {members.map((m) => {
                  const userId = m.user?._id || m.user;
                  const userName = m.user?.name || m.user?.email || 'Member';
                  return (
                    <option key={userId} value={userId}>
                      {userName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              className="btn-primary flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
