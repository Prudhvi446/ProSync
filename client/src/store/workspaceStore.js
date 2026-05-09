import { create } from 'zustand';

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  activeWorkspace: JSON.parse(localStorage.getItem('prosync_active_workspace') || 'null'),
  isLoading: false,

  setWorkspaces: (workspaces) => {
    set({ workspaces, isLoading: false });

    const current = get().activeWorkspace;
    if (current) {
      const fresh = workspaces.find((w) => w._id === current._id);
      if (fresh) {
        localStorage.setItem('prosync_active_workspace', JSON.stringify(fresh));
        set({ activeWorkspace: fresh });
      }
    } else if (workspaces.length > 0) {
      get().setActiveWorkspace(workspaces[0]);
    }
  },

  addWorkspace: (workspace) =>
    set((state) => ({
      workspaces: [workspace, ...state.workspaces],
    })),

  setActiveWorkspace: (workspace) => {
    localStorage.setItem('prosync_active_workspace', JSON.stringify(workspace));
    set({ activeWorkspace: workspace });
  },

  updateWorkspace: (updatedWorkspace) =>
    set((state) => {
      const newWorkspaces = state.workspaces.map((w) =>
        w._id === updatedWorkspace._id ? updatedWorkspace : w
      );
      const newState = { workspaces: newWorkspaces };

      if (state.activeWorkspace?._id === updatedWorkspace._id) {
        newState.activeWorkspace = updatedWorkspace;
        localStorage.setItem('prosync_active_workspace', JSON.stringify(updatedWorkspace));
      }

      return newState;
    }),

  setLoading: (isLoading) => set({ isLoading }),

  clearAll: () => {
    localStorage.removeItem('prosync_active_workspace');
    set({ workspaces: [], activeWorkspace: null, isLoading: false });
  },
}));
