import { $api } from "@/libs/api";

/**
 * Service for mail-related operations including OTP sending and verification
 * 
 * Note: OTP operations use raw fetch in forgot-password.tsx due to backend
 * API design using query params. Hooks here are provided for consistency.
 */

/**
 * Hook for sending OTP
 * Uses GET /api/mail/send-otp endpoint
 */
export const useSendOTP = (email: string) => {
  return $api.useQuery("get", "/api/mail/send-otp", {
    params: { query: { email } },
    enabled: !!email,
  });
};

/**
 * Verify OTP for email
 * Note: The forgot-password.tsx screen uses raw fetch with query params
 * to match the backend API signature
 */
export const useVerifyOTP = () => {
  return $api.useMutation("post", "/api/mail/verify-otp");
};

/**
 * Hook for sending order mail
 * Uses POST /api/mail/send-order-mail endpoint
 */
export const useSendOrderMail = () => {
  return $api.useMutation("post", "/api/mail/send-order-mail");
};
