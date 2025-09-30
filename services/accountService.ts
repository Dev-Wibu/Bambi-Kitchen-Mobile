import type {
  Account,
  AccountCreateRequest,
  LoginFormData,
  LoginRequest,
  RegisterFormData,
} from "@/interfaces/account.interface";
import type { components } from "@/schema-from-be";
import { useMutation, useQuery } from "@tanstack/react-query";
import createClient from "openapi-fetch";

// Create the API client
const client = createClient<components>({
  baseUrl: "https://bambi.kdz.asia", // Replace with actual API base URL
});

// ==================== ACCOUNT API HOOKS ====================

/**
 * Hook for user authentication/login check (GET /api/user/me)
 */
export const useAuthCheck = () => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data, error } = await client.GET("/api/user/me" as any, {});
      if (error) throw error;
      return data;
    },
  });
};

/**
 * Hook for creating a new account (registration)
 */
export const useRegisterAccount = () => {
  return useMutation({
    mutationFn: async (body: AccountCreateRequest) => {
      const { data, error } = await client.POST("/api/account" as any, { body });
      if (error) throw error;
      return data;
    },
  });
};

/**
 * Hook for getting all accounts
 */
export const useAccounts = () => {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await client.GET("/api/account" as any, {});
      if (error) throw error;
      return data;
    },
  });
};

/**
 * Hook for updating an account
 */
export const useUpdateAccount = () => {
  return useMutation({
    mutationFn: async (body: components["schemas"]["AccountUpdateRequest"]) => {
      const { data, error } = await client.PUT("/api/account" as any, { body });
      if (error) throw error;
      return data;
    },
  });
};

// ==================== TRANSFORM FUNCTIONS ====================

/**
 * Transform login form data to API request format
 */
export const transformLoginRequest = (data: LoginFormData): LoginRequest => ({
  mail: data.mail,
  password: data.password,
});

/**
 * Transform register form data to API request format
 */
export const transformRegisterRequest = (data: RegisterFormData): AccountCreateRequest => {
  // Validate password match if confirmPassword is provided
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    throw new Error("Passwords do not match");
  }

  return {
    name: data.name,
    mail: data.mail,
    password: data.password,
  };
};

/**
 * Transform account response from API
 */
export const transformAccountResponse = (accountResponse: Account): Account => {
  return {
    id: accountResponse.id,
    name: accountResponse.name,
    role: accountResponse.role,
    createAt: accountResponse.createAt,
    updateAt: accountResponse.updateAt,
    password: accountResponse.password, // Usually not returned by API for security
    mail: accountResponse.mail || "", // Add missing mail field
    phone: accountResponse.phone,
    active: accountResponse.active,
  };
};
