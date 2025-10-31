import { $api } from "@/libs/api";

/**
 * Service for user-related operations including password reset
 */

/**
 * Reset password using OTP
 */
export const useResetPassword = () => {
  return $api.useMutation("post", "/api/user/reset-password");
};

/**
 * Get current user information
 */
export const useGetMe = () => {
  return $api.useQuery("get", "/api/user/me");
};
