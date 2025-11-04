import type { AccountCreateRequest, AccountUpdateRequest } from "@/interfaces/account.interface";
import type { LoginRequest } from "@/interfaces/auth.interface";
import { ROLES, type ROLE_TYPE } from "@/interfaces/role.interface";
import { $api } from "@/libs/api";
import { useMutationHandler } from "@/hooks/useMutationHandler";

// ==================== ACCOUNT API HOOKS ====================

/**
 * Hook for registering a new account
 * Uses POST /api/account/register endpoint
 */
export const useRegister = () => {
  return $api.useMutation("post", "/api/account/register");
};

/**
 * Hook for creating a new account (admin/manager)
 * Uses POST /api/account endpoint
 */
export const useCreateAccount = () => {
  return $api.useMutation("post", "/api/account");
};

/**
 * Hook for updating an existing account
 * Uses PUT /api/account endpoint
 */
export const useUpdateAccount = () => {
  return $api.useMutation("put", "/api/account");
};

/**
 * Hook for deleting an account
 * Uses DELETE /api/account/{id} endpoint
 */
export const useDeleteAccount = () => {
  return $api.useMutation("delete", "/api/account/{id}");
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

// ==================== ENHANCED MUTATIONS WITH AUTO TOAST ====================

/**
 * Hook for creating account with automatic toast notifications
 * Wraps useCreateAccount with useMutationHandler to auto-show success/error messages
 */
export const useCreateAccountWithToast = () => {
  const createMutation = useCreateAccount();
  
  return useMutationHandler({
    mutationFn: (variables: any) => createMutation.mutateAsync(variables),
    successMessage: "Tạo tài khoản thành công",
    errorMessage: "Không thể tạo tài khoản",
  });
};

/**
 * Hook for updating account with automatic toast notifications
 * Wraps useUpdateAccount with useMutationHandler to auto-show success/error messages
 */
export const useUpdateAccountWithToast = () => {
  const updateMutation = useUpdateAccount();
  
  return useMutationHandler({
    mutationFn: (variables: any) => updateMutation.mutateAsync(variables),
    successMessage: "Cập nhật tài khoản thành công",
    errorMessage: "Không thể cập nhật tài khoản",
  });
};

/**
 * Hook for deleting account with automatic toast notifications
 * Wraps useDeleteAccount with useMutationHandler to auto-show success/error messages
 */
export const useDeleteAccountWithToast = () => {
  const deleteMutation = useDeleteAccount();
  
  return useMutationHandler({
    mutationFn: (variables: any) => deleteMutation.mutateAsync(variables),
    successMessage: "Xóa tài khoản thành công",
    errorMessage: "Không thể xóa tài khoản",
  });
};

// ==================== TRANSFORM FUNCTIONS ====================

/**
 * Transform account form data to AccountCreateRequest format
 */
export const transformAccountCreateRequest = (data: {
  name: string;
  email: string;
  password: string;
  role: ROLE_TYPE;
}): AccountCreateRequest => {
  return {
    name: data.name,
    mail: data.email,
    password: data.password,
    role: data.role,
  };
};

/**
 * Transform account form data to AccountUpdateRequest format
 */
export const transformAccountUpdateRequest = (data: {
  id: number;
  name: string;
  email: string;
  role: ROLE_TYPE;
  active: boolean;
}): AccountUpdateRequest => {
  return {
    id: data.id,
    name: data.name,
    mail: data.email,
    role: data.role,
    active: data.active,
  };
};

/**
 * Transform register form data for /api/account/register endpoint
 * Returns Account schema object with required fields
 */
export const transformRegisterRequest = (data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
}) => {
  // Validate password match if confirmPassword is provided
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    throw new Error("Passwords do not match");
  }

  return {
    name: data.name,
    mail: data.email,
    password: data.password,
    phone: data.phone,
    role: ROLES.USER as ROLE_TYPE, // Required field for Account schema
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
