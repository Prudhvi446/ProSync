import React, { useState, useEffect } from 'react';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { useWorkspaceStore } from '../store/workspaceStore';
import { getWorkspaceMembersApi } from '../api/workspaceApi';

const roleStyles = {
  admin: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  member: 'bg-dark-600/30 text-dark-300 border-dark-600/30',
};

const MembersPanel = () => {
  const { activeWorkspace } = useWorkspaceStore();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      if (!activeWorkspace?._id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const result = await getWorkspaceMembersApi(activeWorkspace._id);
        setMembers(result.data.members);
      } catch (error) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  }, [activeWorkspace?._id]);

  if (loading || !activeWorkspace) return null;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
          <HiOutlineUserGroup className="text-blue-400 text-sm" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Team Members</h3>
          <p className="text-xs text-dark-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="space-y-2">
        {members.map((member) => {
          const user = member.user;
          if (!user) return null;

          return (
            <div
              key={user._id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-dark-800/50 transition-colors duration-150"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    user.name?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-dark-500 truncate">{user.email}</p>
                </div>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${roleStyles[member.role] || roleStyles.member}`}>
                {member.role}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MembersPanel;
