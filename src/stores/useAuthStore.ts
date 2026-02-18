// src/stores/useAuthStore.ts
import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  isBootstrapped: boolean;
  setAccessToken: (token: string | null) => void;
  setBootstrapped: (v: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isBootstrapped: false,
  setAccessToken: (token) => set({ accessToken: token }),
  setBootstrapped: (v) => set({ isBootstrapped: v }),
  clearAuth: () => set({ accessToken: null }),
}));