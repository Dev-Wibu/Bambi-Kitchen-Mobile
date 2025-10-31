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
 * Get current user information
 */
export const useGetMe = () => {
  return $api.useQuery("get", "/api/user/me");
};

/**
 * Reset password using OTP
 * Note: The forgot-password.tsx screen uses raw fetch with query params
 * to match the backend API signature
 */
export const useResetPassword = () => {
  return $api.useMutation("post", "/api/user/reset-password");
};
