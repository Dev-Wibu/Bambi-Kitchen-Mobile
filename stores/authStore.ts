import type { AuthLoginData } from "@/interfaces/auth.interface";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getPersistStorage } from "./persistStorage";

// Storage key
const AUTH_STORAGE_KEY = "@auth_data";

interface AuthState {
  isLoggedIn: boolean;
  user: AuthLoginData | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: AuthLoginData | null) => void;
  setToken: (token: string | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      token: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      setIsLoading: (isLoading) => set({ isLoading }),
      clearAuth: () => set({ user: null, token: null, isLoggedIn: false }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(getPersistStorage),
      onRehydrateStorage: () => (state) => {
        // After rehydration, set loading to false
        if (state) {
          state.setIsLoading(false);

          // CRITICAL FIX: Reset isLoggedIn to false on app restart
          // User must actively log in again to set isLoggedIn = true
          // This prevents auto-fetching notifications with potentially expired tokens
          if (state.isLoggedIn) {
            console.log(
              "⚠️ Resetting isLoggedIn to false on app restart - user must re-authenticate"
            );
            state.setIsLoggedIn(false);
          }
        }
      },
    }
  )
);
