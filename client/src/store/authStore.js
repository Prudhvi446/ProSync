import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('prosync_access_token') || null,
  refreshToken: localStorage.getItem('prosync_refresh_token') || null,
  isAuthenticated: !!localStorage.getItem('prosync_access_token'),
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('prosync_access_token', accessToken);
    localStorage.setItem('prosync_refresh_token', refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('prosync_access_token', accessToken);
    localStorage.setItem('prosync_refresh_token', refreshToken);
    set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('prosync_access_token');
    localStorage.removeItem('prosync_refresh_token');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
