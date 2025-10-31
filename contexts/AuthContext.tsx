import type { AuthLoginData } from "@/interfaces/auth.interface";
import { API_BASE_URL, fetchClient } from "@/libs/api";
import { extractRole } from "@/services/accountService";
import { useAuthStore } from "@/stores/authStore";
import React, { createContext, useContext } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  user: AuthLoginData | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<AuthLoginData>;
  loginWithGoogle: () => Promise<void>;
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

      // Use JWT-based login endpoint with JSON format
      const response = await fetch(`${API_BASE_URL}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: normalizedPhone, // Backend expects phone as username
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

      // Store the token
      setToken(token);

      // After successful login, get user info using the token
      const userInfoResponse = await fetchClient.GET("/api/user/me");

      if (userInfoResponse.data) {
        const userData = userInfoResponse.data as any;
        const userId = userData.id || 0;
        const name = userData.name || normalizedPhone;
        const role = userData.role;

        const authData: AuthLoginData = {
          userId: userId,
          name: name,
          role: extractRole(Array.isArray(role) ? role : [role]),
        };

        await saveAuthState(authData);
        return authData;
      } else {
        throw new Error("Failed to get user info");
      }
    } catch (error) {
      console.error("Login error:", error);
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

      // Register using the /api/account/register endpoint
      // Note: This endpoint doesn't use the token middleware since we don't have a token yet
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
          role: "USER", // Required field - defaults to USER for self-registration
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Registration failed");
      }

      // After successful registration, automatically log in
      const authData = await login(normalizedPhone, password);
      return authData;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const logout = async () => {
    // JWT tokens are stateless, so just clear local state
    // No need to call backend logout endpoint
    await clearAuthState();
  };

  const loginWithGoogle = async () => {
    try {
      // Import WebBrowser for OAuth flow
      const WebBrowser = await import("expo-web-browser");
      
      // Construct the Google OAuth URL
      const googleAuthUrl = `${API_BASE_URL}/api/user/login-with-google`;
      
      // Open the OAuth flow in a web browser
      const result = await WebBrowser.openAuthSessionAsync(
        googleAuthUrl,
        `${API_BASE_URL}/oauth2/callback`
      );

      if (result.type === "success") {
        // The URL will contain the token as a query parameter
        // The OAuth2 callback screen will handle extracting it
        const url = result.url;
        if (url) {
          // The redirect will be handled by the deep link system
          // which will navigate to the oauth2-callback screen
        }
      } else if (result.type === "cancel") {
        throw new Error("Google login was cancelled");
      }
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetchClient.GET("/api/user/me");

      if (response.data) {
        const userData = response.data as any;
        const userId = userData.id || 0;
        const name = userData.name || "";
        const role = userData.role;

        const authData: AuthLoginData = {
          userId: userId,
          name: name,
          role: extractRole(Array.isArray(role) ? role : [role]),
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
        loginWithGoogle,
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
