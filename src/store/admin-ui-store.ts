import { create } from "zustand";

interface AdminUiState {
  mobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

export const useAdminUiStore = create<AdminUiState>()((set) => ({
  mobileSidebarOpen: false,
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
}));
