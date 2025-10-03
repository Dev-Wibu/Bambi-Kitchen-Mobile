import type { AuthLoginData } from "@/interfaces/auth.interface";
import { API_BASE_URL, fetchClient } from "@/libs/api";
import { extractRole } from "@/services/accountService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

// Storage keys
const AUTH_STORAGE_KEY = "@auth_data";

interface AuthContextType {
  isLoggedIn: boolean;
  user: AuthLoginData | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthLoginData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from storage on mount
  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const authData: AuthLoginData = JSON.parse(storedAuth);
        setUser(authData);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Failed to load auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthState = async (authData: AuthLoginData) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      setUser(authData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Failed to save auth state:", error);
      throw error;
    }
  };

  const clearAuthState = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Failed to clear auth state:", error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Use Spring Security form login endpoint
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
        credentials: "include", // Important for session cookies
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      // After successful login, get user info
      const userInfoResponse = await fetchClient.GET("/api/user/me", {
        credentials: "include",
      });

      if (userInfoResponse.data) {
        const { name, role, userId } = userInfoResponse.data as any;

        const authData: AuthLoginData = {
          userId: userId || 0,
          name: name || email,
          role: extractRole(role || []),
        };

        await saveAuthState(authData);
      } else {
        throw new Error("Failed to get user info");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      await clearAuthState();
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetchClient.GET("/api/user/me", {
        credentials: "include",
      });

      if (response.data) {
        const { name, role, userId } = response.data as any;

        const authData: AuthLoginData = {
          userId: userId || 0,
          name: name || "",
          role: extractRole(role || []),
        };

        await saveAuthState(authData);
      } else {
        await clearAuthState();
      }
    } catch (error) {
      console.error("Check auth error:", error);
      await clearAuthState();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
