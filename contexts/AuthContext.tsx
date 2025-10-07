import type { AuthLoginData } from "@/interfaces/auth.interface";
import { API_BASE_URL } from "@/libs/api";
// MOCKAPI: Import mock API functions - REMOVE WHEN BE IS READY
import { mockLogin, mockRegister } from "@/services/accountMockApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

// Storage keys
const AUTH_STORAGE_KEY = "@auth_data";

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

  const login = async (phone: string, password: string): Promise<AuthLoginData> => {
    try {
      // MOCKAPI: Using mock login - REMOVE WHEN BE IS READY
      // Uncomment the code below when backend CORS and session issues are fixed
      /*
      // Use Spring Security form login endpoint
      const formData = new URLSearchParams();
      formData.append("username", phone); // Backend expects phone as username
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
        const errorText = await response.text();
        throw new Error(errorText || "Login failed");
      }

      // After successful login, get user info
      const userInfoResponse = await fetchClient.GET("/api/user/me", {
        credentials: "include",
      });

      if (userInfoResponse.data) {
        const { name, role, userId } = userInfoResponse.data as any;

        const authData: AuthLoginData = {
          userId: userId || 0,
          name: name || phone,
          role: extractRole(role || []),
        };

        await saveAuthState(authData);
      } else {
        throw new Error("Failed to get user info");
      }
      */

      // MOCKAPI: Mock login implementation
      const loginResult = await mockLogin(phone, password);

      if (!loginResult.success || !loginResult.account) {
        throw new Error(loginResult.error || "Login failed");
      }

      const account = loginResult.account;
      const authData: AuthLoginData = {
        userId: account.id || 0,
        name: account.name || phone,
        role: account.role || "USER",
      };

      await saveAuthState(authData);
      return authData;
      // END MOCKAPI
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
      // MOCKAPI: Using mock register - REMOVE WHEN BE IS READY
      // Uncomment the code below when backend CORS and session issues are fixed
      /*
      // Register using the /api/account/register endpoint
      const response = await fetchClient.POST("/api/account/register", {
        body: {
          name,
          mail: email,
          password,
          phone, // Required field
          role: "USER", // Required field - defaults to USER for self-registration
        },
      });

      if (!response.data) {
        // Try to extract error message from response
        const error = response.error as any;
        const errorMessage = error?.message || error?.detail || "Registration failed";
        throw new Error(errorMessage);
      }

      // After successful registration, automatically log in
      await login(phone, password);
      */

      // MOCKAPI: Mock register implementation
      const registerResult = await mockRegister({
        name,
        mail: email,
        password,
        phone,
        role: "USER",
      });

      if (!registerResult.success || !registerResult.account) {
        throw new Error(registerResult.error || "Registration failed");
      }

      // After successful registration, automatically log in
      const authData = await login(phone, password);
      return authData;
      // END MOCKAPI
    } catch (error) {
      console.error("Register error:", error);
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
      // MOCKAPI: Disabled check auth - using local storage only
      // Uncomment the code below when backend CORS and session issues are fixed
      /*
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
      */

      // MOCKAPI: For now, just rely on local storage
      // When BE is ready, uncomment the code above to validate session
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (!storedAuth) {
        await clearAuthState();
      }
      // END MOCKAPI
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
