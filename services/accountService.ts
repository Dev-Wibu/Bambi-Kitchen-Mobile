import type { AccountCreateRequest } from "@/interfaces/account.interface";
import type { LoginRequest } from "@/interfaces/auth.interface";
import { ROLES, type ROLE_TYPE } from "@/interfaces/role.interface";
import { $api } from "@/libs/api";

// ==================== ACCOUNT API HOOKS ====================

/**
 * Hook for registering a new account
 * Uses POST /api/account/register endpoint
 */
export const useRegister = () => {
  // Since schema doesn't have /register endpoint exposed,
  // we'll use the POST /api/account endpoint which maps to save()
  // Note: BE has both save() and register() but only save() is in OpenAPI spec
  return $api.useMutation("post", "/api/account");
};

/**
 * Hook for getting current user info
 * Uses GET /api/user/me endpoint
 */
export const useGetMe = () => {
  return $api.useQuery("get", "/api/user/me");
};

/**
 * Hook for getting all accounts (admin only)
 */
export const useAccounts = () => {
  return $api.useQuery("get", "/api/account", {});
};

/**
 * Hook for getting account by ID
 */
export const useGetAccountById = (id: number) => {
  return $api.useQuery("get", "/api/account/{id}", {
    params: { path: { id } },
    enabled: !!id,
  });
};

// ==================== TRANSFORM FUNCTIONS ====================

/**
 * Transform register form data to AccountCreateRequest format
 */
export const transformRegisterRequest = (data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
}): AccountCreateRequest => {
  // Validate password match if confirmPassword is provided
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    throw new Error("Passwords do not match");
  }

  return {
    name: data.name,
    mail: data.email,
    password: data.password,
  };
};

/**
 * Transform login form data to login request
 * Note: Spring Security form login expects 'username' and 'password'
 */
export const transformLoginRequest = (data: { email: string; password: string }): LoginRequest => {
  return {
    username: data.email, // Spring Security uses 'username' parameter
    password: data.password,
  };
};

/**
 * Extract role from API response
 * BE returns role as array of objects with authority property
 */
export const extractRole = (roles: any[]): ROLE_TYPE => {
  if (!roles || roles.length === 0) {
    return ROLES.USER;
  }

  // Handle different role response formats
  const roleStr =
    typeof roles[0] === "string" ? roles[0] : roles[0]?.authority || roles[0]?.role || "USER";

  // Remove ROLE_ prefix if present
  const cleanRole = roleStr.replace("ROLE_", "");

  return (cleanRole.toUpperCase() as ROLE_TYPE) || ROLES.USER;
};
