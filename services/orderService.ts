import { $api } from "@/libs/api";

// ==================== ORDER API HOOKS ====================

/**
 * Hook for creating a new order
 * Uses POST /api/order endpoint
 */
export const useCreateOrder = () => {
  return $api.useMutation("post", "/api/order");
};

/**
 * Hook for updating an existing order
 * Uses PUT /api/order endpoint
 */
export const useUpdateOrder = () => {
  return $api.useMutation("put", "/api/order");
};

/**
 * Hook for adding feedback to an order
 * Uses PUT /api/order/feedback endpoint
 */
export const useFeedbackOrder = () => {
  return $api.useMutation("put", "/api/order/feedback");
};

/**
 * Hook for confirming an order (test endpoint)
 * Uses GET /api/test/order/confirm/{id} endpoint
 */
export const useConfirmOrder = () => {
  return $api.useMutation("get", "/api/test/order/confirm/{id}");
};

/**
 * Hook for canceling an order (test endpoint)
 * Uses GET /api/test/order/cancel/{orderId} endpoint
 */
export const useCancelOrder = () => {
  return $api.useMutation("get", "/api/test/order/cancel/{orderId}");
};
