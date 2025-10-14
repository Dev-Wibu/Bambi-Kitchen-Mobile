import { Platform } from "react-native";
import type { StateStorage } from "zustand/middleware";

const noopStorage: StateStorage = {
  getItem: async () => null,
  setItem: async () => undefined,
  removeItem: async () => undefined,
};

let cachedStorage: StateStorage | null = null;

export const getPersistStorage = (): StateStorage => {
  if (cachedStorage) {
    return cachedStorage;
  }

  if (Platform.OS === "web") {
    if (typeof window === "undefined" || !window.localStorage) {
      cachedStorage = noopStorage;
      return cachedStorage;
    }

    cachedStorage = {
      getItem: async (name) => {
        try {
          return window.localStorage.getItem(name);
        } catch (error) {
          console.warn("localStorage getItem failed", error);
          return null;
        }
      },
      setItem: async (name, value) => {
        try {
          window.localStorage.setItem(name, value);
        } catch (error) {
          console.warn("localStorage setItem failed", error);
        }
      },
      removeItem: async (name) => {
        try {
          window.localStorage.removeItem(name);
        } catch (error) {
          console.warn("localStorage removeItem failed", error);
        }
      },
    } satisfies StateStorage;

    return cachedStorage;
  }

  const asyncStorageModule: StateStorage =
    require("@react-native-async-storage/async-storage").default;
  cachedStorage = asyncStorageModule;
  return cachedStorage;
};
