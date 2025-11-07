import { useMutationHandler } from "@/hooks/useMutationHandler";
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

// ==================== ORDER QUERY HOOKS ====================

/**
 * Hook for getting all orders
 * Uses GET /api/order endpoint
 */
export const useOrders = () => {
  return $api.useQuery("get", "/api/order");
};

/**
 * Hook for getting order by ID
 * Uses GET /api/order/{id} endpoint
 */
export const useOrderById = (id: number) => {
  return $api.useQuery("get", "/api/order/{id}", {
    params: { path: { id } },
  });
};

/**
 * Hook for getting orders by user ID
 * Uses GET /api/order/user/{userId} endpoint
 */
export const useOrdersByUserId = (userId: number) => {
  return $api.useQuery("get", "/api/order/user/{userId}", {
    params: { path: { userId } },
  });
};

/**
 * Hook for getting feedbacks
 * Uses GET /api/order/getFeedbacks endpoint
 */
export const useFeedbacks = () => {
  return $api.useQuery("get", "/api/order/getFeedbacks");
};

// ==================== ORDER DETAIL HOOKS ====================

/**
 * Hook for getting all order details
 * Uses GET /api/order-detail endpoint
 */
export const useOrderDetails = () => {
  return $api.useQuery("get", "/api/order-detail");
};

/**
 * Hook for getting order detail by ID
 * Uses GET /api/order-detail/{detailId} endpoint
 */
export const useOrderDetailById = (detailId: number) => {
  return $api.useQuery("get", "/api/order-detail/{detailId}", {
    params: { path: { detailId } },
  });
};

/**
 * Hook for getting order details by order ID
 * Uses GET /api/order-detail/by-order/{orderId} endpoint
 */
export const useOrderDetailsByOrderId = (orderId: number) => {
  return $api.useQuery("get", "/api/order-detail/by-order/{orderId}", {
    params: { path: { orderId } },
  });
};

// ==================== ENHANCED MUTATIONS WITH AUTO TOAST ====================

/**
 * Hook for updating order with automatic toast notifications
 */
export const useUpdateOrderWithToast = () => {
  const updateMutation = useUpdateOrder();

  return useMutationHandler({
    mutationFn: (variables: any) => updateMutation.mutateAsync(variables),
    successMessage: "Order updated successfully",
    errorMessage: "Unable to update order",
  });
};

/**
 * Hook for adding feedback with automatic toast notifications
 */
export const useFeedbackOrderWithToast = () => {
  const feedbackMutation = useFeedbackOrder();

  return useMutationHandler({
    mutationFn: (variables: any) => feedbackMutation.mutateAsync(variables),
    successMessage: "Feedback submitted successfully",
    errorMessage: "Unable to submit feedback",
  });
};
