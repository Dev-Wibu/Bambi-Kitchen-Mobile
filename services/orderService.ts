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

// ==================== ORDER HELPERS ====================

/**



 * Compute cart total in decimal units (e.g., dollars) from cart items that store price in cents.



 */

export const computeCartTotalDecimal = (items: Pick<CartItem, "price" | "quantity">[]): number => {
  return items.reduce((sum, i) => sum + (i.price / 100) * i.quantity, 0);
};

/**



 * Transform cart items into backend MakeOrderRequest payload.



 * - Assumes CartItem.price is in cents; converts to decimal total.



 * - Passes through optional dishTemplate and recipe when present.



 */

export const transformCartToMakeOrderRequest = (params: {
  accountId: number;

  paymentMethod: string;

  note?: string;

  items: CartItem[];
}): MakeOrderRequest => {
  const { accountId, paymentMethod, note, items } = params;

  const totalPrice = computeCartTotalDecimal(items);

  const orderItems: OrderItemDTO[] = items.map((i) => ({
    // Omit dishId when it's not a real preset dish (e.g., custom bowl with 0)

    ...(i.dishId && i.dishId > 0 ? { dishId: i.dishId } : {}),

    basedOnId: i.basedOnId,

    name: i.name,

    quantity: i.quantity,

    note: i.note,

    dishTemplate: i.dishTemplate,

    recipe: i.recipe as RecipeItemDTO[] | undefined,
  }));

  return {
    accountId,

    paymentMethod,

    note,

    totalPrice,

    items: orderItems,
  };
};

