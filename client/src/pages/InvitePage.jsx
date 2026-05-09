import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { HiOutlineSparkles, HiOutlineMailOpen } from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const InvitePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const workspaceId = searchParams.get('workspace');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to accept the invite');
      navigate(`/login?redirect=/invite?workspace=${workspaceId}`);
      return;
    }

    if (!workspaceId) {
      toast.error('Invalid invite link');
      return;
    }

    setIsProcessing(true);
    try {
      toast.success('Welcome to the workspace!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to accept invite');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-8">
      <div className="max-w-md w-full animate-fade-in">
        <div className="card text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center mx-auto mb-6">
            <HiOutlineMailOpen className="text-primary-400 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Workspace Invite</h1>
          <p className="text-dark-400 mb-6">You've been invited to join a workspace on ProSync.</p>
          <button onClick={handleAccept} disabled={isProcessing} className="btn-primary w-full" id="btn-accept-invite">
            {isProcessing ? 'Joining...' : 'Accept Invite'}
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full mt-3">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
