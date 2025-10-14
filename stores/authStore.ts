import type { AuthLoginData } from "@/interfaces/auth.interface";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getPersistStorage } from "./persistStorage";

// Storage key
const AUTH_STORAGE_KEY = "@auth_data";

interface AuthState {
  isLoggedIn: boolean;
  user: AuthLoginData | null;
  isLoading: boolean;
  setUser: (user: AuthLoginData | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      setIsLoading: (isLoading) => set({ isLoading }),
      clearAuth: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(getPersistStorage),
      onRehydrateStorage: () => (state) => {
        // After rehydration, set loading to false
        if (state) {
          state.setIsLoading(false);
        }
      },
    }
  )
);
