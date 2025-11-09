import { useMutationHandler } from "@/hooks/useMutationHandler";

import type { MakeOrderRequest, OrderItemDTO, RecipeItemDTO } from "@/interfaces/order.interface";

import { $api } from "@/libs/api";

import type { CartItem } from "@/stores/cartStore";

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

// ==================== TRANSFORM HELPERS ====================

/**



 * Convert cart total (cents) to decimal number expected by backend (e.g., 12345 -> 123.45)



 */

export const computeCartTotalDecimal = (items: CartItem[]): number => {
  const cents = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);

  return Math.round(cents) / 100;
};

/**

 * Return total in minor currency unit (cents) as integer.

 * Payment gateways often expect integer amounts (e.g., VND) so use this for payment payloads.

 */

export const computeCartTotalMinorUnit = (items: CartItem[]): number => {
  const cents = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);

  return Math.round(cents);
};

type BuildOrderPayloadInput = {
  accountId: number;

  paymentMethod: "CASH" | "MOMO" | "VNPAY" | string;

  note?: string;

  items: CartItem[];
};

/**



 * Transform CartItems into MakeOrderRequest payload



 * Rules:



 * - Preset dish (dishId>0 and no recipe/template) -> send dishId + quantity



 * - Custom bowl (has recipe or template) -> omit dishId, include recipe[], and optional size from template



 */

export const transformCartToMakeOrderRequest = (
  input: BuildOrderPayloadInput
): MakeOrderRequest => {
  const orderItems: OrderItemDTO[] = input.items.map((ci) => {
    // Determine if recipe array exists (customization) and whether dishId is present

    const hasRecipe = Array.isArray(ci.recipe) && ci.recipe.length > 0;

    const base: OrderItemDTO = {
      quantity: ci.quantity || 1,

      note: ci.note,
    } as any;

    // Case A: plain preset dish (has dishId and no recipe) -> send dishId (+ dishTemplate if size selected)

    if (ci.dishId && ci.dishId > 0 && !hasRecipe) {
      return {
        ...base,

        dishId: ci.dishId,

        // include template if user selected a size for a preset dish

        dishTemplate: ci.dishTemplate as any | undefined,
      } as OrderItemDTO;
    }

    // Case B: custom bowl (either basedOnId present or recipe present)

    const recipe: RecipeItemDTO[] = (ci.recipe || []).map((r) => {
      const rawSource = (r as any).sourceType;

      const sourceType =
        rawSource === "BASE" || rawSource === "ADDON" || rawSource === "REMOVED"
          ? rawSource
          : "ADDON";

      return {
        ingredientId: r.ingredientId,

        quantity: r.quantity || 1,

        sourceType,
      } as any;
    }) as any;

    const out: OrderItemDTO = {
      ...base,

      // include basedOnId when customizing from an existing dish

      basedOnId: ci.basedOnId ?? undefined,

      name: ci.name ?? undefined,

      recipe,

      dishTemplate: ci.dishTemplate as any | undefined,

      size: (ci.dishTemplate as any)?.size ?? undefined,
    } as any;

    return out;
  });

  const payload: MakeOrderRequest = {
    accountId: input.accountId as any,

    paymentMethod: String(input.paymentMethod).toUpperCase() as any,

    note: input.note,

    // Use minor currency unit (integer) for payments to avoid provider minimum amount issues

    totalPrice: computeCartTotalMinorUnit(input.items) as any,

    items: orderItems as any,
  } as any;

  return payload;
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
