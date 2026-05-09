import axiosInstance from './axiosInstance';

export const createWorkspaceApi = async (name) => {
  const { data } = await axiosInstance.post('/workspaces', { name });
  return data;
};

export const getMyWorkspacesApi = async () => {
  const { data } = await axiosInstance.get('/workspaces/my');
  return data;
};

export const getWorkspaceByIdApi = async (workspaceId) => {
  const { data } = await axiosInstance.get(`/workspaces/${workspaceId}`);
  return data;
};

export const getWorkspaceMembersApi = async (workspaceId) => {
  const { data } = await axiosInstance.get(`/workspaces/${workspaceId}/members`);
  return data;
};

export const inviteMemberApi = async (workspaceId, email, role = 'member') => {
  const { data } = await axiosInstance.post(`/workspaces/${workspaceId}/invite`, { email, role });
  return data;
};

export const getMyInvitationsApi = async () => {
  const { data } = await axiosInstance.get('/workspaces/invitations');
  return data;
};

export const respondToInvitationApi = async (invitationId, action) => {
  const { data } = await axiosInstance.patch(`/workspaces/invitations/${invitationId}`, { action });
  return data;
};
