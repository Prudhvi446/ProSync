import React, { useState, useEffect } from 'react';
import { HiOutlineMailOpen, HiCheck, HiX } from 'react-icons/hi';
import { getMyInvitationsApi, respondToInvitationApi, getMyWorkspacesApi } from '../api/workspaceApi';
import { useWorkspaceStore } from '../store/workspaceStore';
import toast from 'react-hot-toast';

const InvitationsPanel = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);
  const { setWorkspaces, addWorkspace } = useWorkspaceStore();

  const loadInvitations = async () => {
    try {
      const result = await getMyInvitationsApi();
      setInvitations(result.data.invitations);
    } catch (error) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleRespond = async (invitationId, action) => {
    setResponding(invitationId);
    try {
      const result = await respondToInvitationApi(invitationId, action);
      toast.success(result.message);

      setInvitations((prev) => prev.filter((inv) => inv._id !== invitationId));

      if (action === 'accept') {
        const wsResult = await getMyWorkspacesApi();
        setWorkspaces(wsResult.data.workspaces);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} invitation`);
    } finally {
      setResponding(null);
    }
  };

  if (loading) return null;
  if (invitations.length === 0) return null;

  return (
    <div className="card mb-6 animate-slide-down">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
          <HiOutlineMailOpen className="text-amber-400 text-sm" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Pending Invitations</h3>
          <p className="text-xs text-dark-500">{invitations.length} invitation{invitations.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="space-y-3">
        {invitations.map((inv) => (
          <div
            key={inv._id}
            className="flex items-center justify-between bg-dark-900/50 rounded-xl p-4 border border-dark-700/30"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {inv.workspace?.name || 'Unknown Workspace'}
              </p>
              <p className="text-xs text-dark-400 mt-0.5">
                Invited by {inv.invitedBy?.name || 'Unknown'}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleRespond(inv._id, 'accept')}
                disabled={responding === inv._id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-600/20 transition-all duration-150 disabled:opacity-50"
                id={`btn-accept-${inv._id}`}
              >
                <HiCheck className="text-sm" />
                Accept
              </button>
              <button
                onClick={() => handleRespond(inv._id, 'reject')}
                disabled={responding === inv._id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs font-medium rounded-lg border border-red-600/20 transition-all duration-150 disabled:opacity-50"
                id={`btn-reject-${inv._id}`}
              >
                <HiX className="text-sm" />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvitationsPanel;
