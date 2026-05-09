import React, { useState } from 'react';
import { HiX } from 'react-icons/hi';
import { inviteMemberApi } from '../api/workspaceApi';
import { useWorkspaceStore } from '../store/workspaceStore';
import toast from 'react-hot-toast';

const InviteMemberModal = ({ isOpen, onClose }) => {
  const { activeWorkspace } = useWorkspaceStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !activeWorkspace || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await inviteMemberApi(activeWorkspace._id, email.trim(), role);
      toast.success(result.message || 'Invitation sent!');
      setEmail('');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-dark-800 border border-dark-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Invite Member</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-dark-300 mb-1.5">
              Email Address
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="invite-role" className="block text-sm font-medium text-dark-300 mb-1.5">
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="btn-primary flex-1"
            >
              {isSubmitting ? 'Inviting...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
