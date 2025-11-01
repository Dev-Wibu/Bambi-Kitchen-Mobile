import { $api } from "@/libs/api";

/**
 * Service for user-related operations including password reset and OAuth
 * 
 * Note: Forgot password and Google OAuth flows use raw fetch/expo-web-browser
 * in their respective components due to backend API design using query params
 * and OAuth redirect flows. Hooks here are provided for consistency but may
 * not be actively used.
 */

/**
 * Hook for user login
 * Uses POST /api/user/login endpoint
 */
export const useLogin = () => {
  return $api.useMutation("post", "/api/user/login");
};

/**
 * Get current user information
 */
export const useGetMe = () => {
  return $api.useQuery("get", "/api/user/me");
};

/**
 * Hook for Google login
 * Uses GET /api/user/login-with-google endpoint
 */
export const useGoogleLogin = () => {
  return $api.useMutation("get", "/api/user/login-with-google");
};

/**
 * Hook for forgot password
 * Uses GET /api/user/forgot-password endpoint
 */
export const useForgotPassword = (email: string) => {
  return $api.useQuery("get", "/api/user/forgot-password", {
    params: { query: { email } },
    enabled: !!email,
  });
};

/**
 * Reset password using OTP
 * Note: The forgot-password.tsx screen uses raw fetch with query params
 * to match the backend API signature
 */
export const useResetPassword = () => {
  return $api.useMutation("post", "/api/user/reset-password");
};
