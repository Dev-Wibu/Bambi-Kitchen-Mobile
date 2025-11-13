import { useMutationHandler } from "@/hooks/useMutationHandler";

import type { MakeOrderRequest, OrderItemDTO, RecipeItemDTO } from "@/interfaces/order.interface";

import { $api, fetchClient } from "@/libs/api";

import type { CartItem } from "@/stores/cartStore";

import { useMutation } from "@tanstack/react-query";

// ==================== ORDER API HOOKS ====================

/**



 * Hook for creating a new order



 * Uses POST /api/order endpoint



 *



 * NOTE: This endpoint returns a plain text URL (payment redirect) instead of JSON,



 * so we use the raw fetchClient and parse as text to avoid JSON parse errors.



 */

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (variables: { body: MakeOrderRequest }) => {
      // Debug: Log full payload being sent to backend

      if (__DEV__) {
        console.log(
          "🚀 [OrderService] Creating order with payload:",

          JSON.stringify(variables.body, null, 2)
        );

        // Debug: Log price and imageUrl for each item

        console.log("🔍 [OrderService] Items price/imageUrl check:");

        variables.body.items?.forEach((item: any, idx) => {
          console.log(
            `  Item ${idx}: price=${item.price}, imageUrl=${item.imageUrl?.substring(0, 50)}...`
          );
        });

        console.log(
          "🔍 [OrderService] First item details:",

          JSON.stringify(variables.body.items?.[0], null, 2)
        );
      }

      const response = await fetchClient.POST("/api/order", {
        body: variables.body,

        parseAs: "text", // Parse response as text instead of JSON
      });

      if ("error" in response && response.error) {
        throw new Error(response || "Failed to create order");
      }

      return response.data; // This will be the payment URL as a string
    },
  });
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

export const useOrdersByUserId = (userId: number, options?: { enabled?: boolean }) => {
  return $api.useQuery("get", "/api/order/user/{userId}", {
    params: { path: { userId } },

    ...options,
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
  accountId?: number; // Optional for guest orders (staff counter orders)

  paymentMethod: "MOMO" | "VNPAY" | "CASH" | string;

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
  // Default dish template (size M) for items that don't have a template

  const defaultTemplate = {
    size: "M" as const,

    name: "Medium",

    priceRatio: 1.0,

    quantityRatio: 1.0,
  };

  const orderItems: OrderItemDTO[] = input.items.map((ci) => {
    // Determine if recipe array exists (customization) and whether dishId is present

    const hasRecipe = Array.isArray(ci.recipe) && ci.recipe.length > 0;

    const base: OrderItemDTO = {
      quantity: ci.quantity || 1,

      note: ci.note,
    } as any;

    // Ensure every item has a dishTemplate (use default if not provided)

    const dishTemplate = ci.dishTemplate || defaultTemplate;

    // Case A: plain preset dish (has dishId and no recipe) -> send dishId + dishTemplate

    if (ci.dishId && ci.dishId > 0 && !hasRecipe) {
      return {
        ...base,

        dishId: ci.dishId,

        // Always include dishTemplate (required by backend)

        dishTemplate: dishTemplate as any,
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

      // Always include dishTemplate (required by backend)

      dishTemplate: dishTemplate as any,

      size: (dishTemplate as any)?.size ?? undefined,

      // Backend requirement: send calculated price and imageUrl for custom dishes

      price: ci.price ?? undefined,

      imageUrl: ci.imageUrl ?? undefined,
    } as any;

    return out;
  });

  const payload: MakeOrderRequest = {
    // Only include accountId if provided (omit for guest orders)

    ...(input.accountId && { accountId: input.accountId as any }),

    paymentMethod: input.paymentMethod?.toUpperCase() as any,

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

