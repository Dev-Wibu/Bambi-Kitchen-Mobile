import type { Account } from "@/interfaces/account.interface";
import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MMKV } from "react-native-mmkv";

// Storage instance for persisting auth data
const authStorage = new MMKV({
  id: "auth-storage",
  encryptionKey: "your-secret-key", // In production, use a secure key
});

interface AuthContextType {
  account: Account | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (account: Account, token?: string) => void;
  logout: () => void;
  updateAccount: (account: Account) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!account;

  // Load stored auth data on app start
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedAccount = authStorage.getString("account");
        const storedToken = authStorage.getString("token");

        if (storedAccount) {
          const parsedAccount = JSON.parse(storedAccount) as Account;
          setAccount(parsedAccount);
        }
      } catch (error) {
        console.error("Failed to load stored auth data:", error);
        // Clear corrupted data
        authStorage.delete("account");
        authStorage.delete("token");
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = (accountData: Account, token?: string) => {
    setAccount(accountData);

    // Persist auth data
    authStorage.set("account", JSON.stringify(accountData));
    if (token) {
      authStorage.set("token", token);
    }
  };

  const logout = () => {
    setAccount(null);

    // Clear stored auth data
    authStorage.delete("account");
    authStorage.delete("token");
  };

  const updateAccount = (accountData: Account) => {
    setAccount(accountData);

    // Update stored account data
    authStorage.set("account", JSON.stringify(accountData));
  };

  const value: AuthContextType = {
    account,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
