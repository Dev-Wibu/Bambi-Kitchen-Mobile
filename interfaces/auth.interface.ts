import type { ROLE_TYPE } from "./role.interface";

// Authentication response from /api/user/me
export interface AuthUserData {
  name: string;
  role: ROLE_TYPE[];
  userId: number;
}

// Local auth state stored in AsyncStorage
export interface AuthLoginData {
  userId: number;
  name: string;
  role: ROLE_TYPE;
}

// Login request payload
export interface LoginRequest {
  username: string; // email or phone
  password: string;
}

// Register request payload (matches BE Account entity)
export interface RegisterRequest {
  name: string;
  mail: string;
  password: string;
  phone?: string;
}
