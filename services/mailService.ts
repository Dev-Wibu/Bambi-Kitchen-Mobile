import { $api } from "@/libs/api";

/**
 * Service for mail-related operations including OTP sending and verification
 */

/**
 * Verify OTP for email
 */
export const useVerifyOTP = () => {
  return $api.useMutation("post", "/api/mail/verify-otp");
};
