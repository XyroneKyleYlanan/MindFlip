import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  userData: null,
  setUser: (user) => set({ user }),
  setUserData: (userData) => set({ userData }),
  clearUser: () => set({ user: null, userData: null }),
}));

export default useAuthStore;