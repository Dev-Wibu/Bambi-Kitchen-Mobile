import { $api } from "@/libs/api";

// ==================== PAYMENT API HOOKS ====================

/**
 * Hook for testing payment
 * Uses GET /api/payment/test-payment endpoint
 */
export const useTestPayment = (paymentMethodName: string) => {
  return $api.useQuery("get", "/api/payment/test-payment", {
    params: { query: { paymentMethodName } },
    enabled: !!paymentMethodName,
  });
};

/**
 * Hook for handling VNPay return
 * Uses GET /api/payment/vnpay-return endpoint
 */
export const useVnPayReturn = () => {
  return $api.useMutation("get", "/api/payment/vnpay-return");
};

/**
 * Hook for handling Momo return
 * Uses GET /api/payment/momo-return endpoint
 */
export const useMomoReturn = () => {
  return $api.useMutation("get", "/api/payment/momo-return");
};
