import type { components } from "@/schema-from-be";

// Type aliases from the generated schema
export type Account = components["schemas"]["Account"];
export type AccountCreateRequest = components["schemas"]["AccountCreateRequest"];
export type AccountUpdateRequest = components["schemas"]["AccountUpdateRequest"];

// Role types based on schema
export type ACCOUNT_ROLE = "ADMIN" | "STAFF" | "USER";

// Extended interfaces for frontend use
export interface LoginRequest {
  mail: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  mail: string;
  password: string;
  confirmPassword?: string;
}

// Authentication response (assuming the API returns some auth info)
export interface AuthResponse {
  account: Account;
  token?: string;
  // Add other auth-related fields as needed
}

// Form validation types
export interface LoginFormData {
  mail: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  mail: string;
  password: string;
  confirmPassword: string;
}
