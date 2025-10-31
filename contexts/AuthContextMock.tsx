import type { AuthLoginData } from "@/interfaces/auth.interface";
import { API_BASE_URL } from "@/libs/api";
import type { ROLE_TYPE } from "@/interfaces/role.interface";
import { useAuthStore } from "@/stores/authStore";
import React, { createContext, useContext } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  user: AuthLoginData | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<AuthLoginData>;
  register: (
    name: string,
    email: string,
    password: string,
    phone: string
  ) => Promise<AuthLoginData>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * MOCK AUTH PROVIDER
 * 
 * This is a mock authentication provider that bypasses the backend /api/user/me endpoint.
 * It should ONLY be used for development/testing when the backend JWT filter has issues.
 * 
 * HOW TO USE:
 * 1. In app/_layout.tsx, import this file instead of AuthContext.tsx
 * 2. Login will still call real backend /api/user/login to get token
 * 3. Instead of calling /api/user/me, it creates mock user data
 * 
 * TO SWITCH BACK TO REAL AUTH:
 * Change the import in app/_layout.tsx from AuthContextMock to AuthContext
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, user, isLoading, setUser, setToken, setIsLoggedIn, clearAuth } =
    useAuthStore();

  const normalizeIdentifier = (identifier: string) => {
    const trimmed = identifier.trim();
    if (/^\+84\d+$/.test(trimmed)) {
      return `0${trimmed.slice(3)}`;
    }
    return trimmed;
  };

  const saveAuthState = async (authData: AuthLoginData) => {
    try {
      setUser(authData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Failed to save auth state:", error);
      throw error;
    }
  };

  const clearAuthState = async () => {
    try {
      clearAuth();
    } catch (error) {
      console.error("Failed to clear auth state:", error);
    }
  };

  const login = async (phone: string, password: string): Promise<AuthLoginData> => {
    try {
      const normalizedPhone = normalizeIdentifier(phone);
      const normalizedPassword = password.trim();

      console.log("🔐 [MOCK AUTH] Attempting login...");

      // Use JWT-based login endpoint with JSON format
      const response = await fetch(`${API_BASE_URL}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: normalizedPhone,
          password: normalizedPassword,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Login failed");
      }

      // Extract JWT token from response body
      const token = await response.text();

      if (!token) {
        throw new Error("No token received from server");
      }

      console.log("✅ [MOCK AUTH] Token received successfully");

      // Store the token
      setToken(token);

      // ⚠️ MOCK: Instead of calling /api/user/me, create mock user data
      // This bypasses the 401 error from backend
      console.log("🎭 [MOCK AUTH] Creating mock user data (skipping /api/user/me)");

      const mockUserData: AuthLoginData = {
        userId: 1, // Mock user ID
        name: `User ${normalizedPhone}`, // Mock name from phone
        role: "USER" as ROLE_TYPE, // Default to USER role
      };

      console.log("✅ [MOCK AUTH] Login successful with mock data:", mockUserData);

      await saveAuthState(mockUserData);
      return mockUserData;
    } catch (error) {
      console.error("❌ [MOCK AUTH] Login error:", error);
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone: string
  ): Promise<AuthLoginData> => {
    try {
      const normalizedPhone = normalizeIdentifier(phone);

      console.log("📝 [MOCK AUTH] Attempting registration...");

      // Register using the /api/account/register endpoint
      const response = await fetch(`${API_BASE_URL}/api/account/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          mail: email,
          password,
          phone: normalizedPhone,
          role: "USER",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Registration failed");
      }

      console.log("✅ [MOCK AUTH] Registration successful");

      // After successful registration, automatically log in
      const authData = await login(normalizedPhone, password);
      return authData;
    } catch (error) {
      console.error("❌ [MOCK AUTH] Register error:", error);
      throw error;
    }
  };

  const logout = async () => {
    console.log("👋 [MOCK AUTH] Logging out...");
    await clearAuthState();
  };

  const checkAuth = async () => {
    try {
      console.log("🔍 [MOCK AUTH] Checking authentication status...");
      
      const currentToken = useAuthStore.getState().token;
      const currentUser = useAuthStore.getState().user;

      // If we have a token and user in storage, assume we're logged in
      if (currentToken && currentUser) {
        console.log("✅ [MOCK AUTH] User already authenticated:", currentUser);
        await saveAuthState(currentUser);
      } else {
        console.log("⚠️ [MOCK AUTH] No authentication found");
        await clearAuthState();
      }
    } catch (error) {
      console.error("❌ [MOCK AUTH] Check auth error:", error);
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
        register,
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
