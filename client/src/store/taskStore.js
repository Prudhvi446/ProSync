import { create } from 'zustand';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  setTasks: (tasks) => set({ tasks, isLoading: false, error: null }),

  addTask: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks],
    })),

  updateTask: (updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t._id === updatedTask._id ? updatedTask : t
      ),
    })),

  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t._id !== taskId),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  getTasksByStatus: (status) => {
    return get().tasks.filter((t) => t.status === status);
  },
}));
