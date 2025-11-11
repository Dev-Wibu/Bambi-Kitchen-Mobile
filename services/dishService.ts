import { useMutationHandler } from "@/hooks/useMutationHandler";
import { $api } from "@/libs/api";

// ==================== TRANSFORMS ====================

import type { AuthLoginData } from "@/interfaces/auth.interface";

import type { DishCreateRequest } from "@/interfaces/dish.interface";

import type { CartItem } from "@/stores/cartStore";

// ==================== DISH API HOOKS ====================

/**































































 * Hook for getting all dishes































































 * Uses GET /api/dish endpoint































 *































 */

export const useDishes = () => {
  return $api.useQuery("get", "/api/dish", {});
};

/**















 * Hook for getting all dishes via the dedicated endpoint















 * Uses GET /api/dish/get-all















 */

export const useGetAllDishes = () => {
  return $api.useQuery("get", "/api/dish/get-all", {});
};

/**































































































 * Hook for creating/updating a dish































































































 * Uses POST /api/dish endpoint































































































 */

export const useCreateDish = () => {
  return $api.useMutation("post", "/api/dish");
};

/**
 * Hook for toggling dish active status
 * Uses GET /api/dish/toggle-active/{id} endpoint
 */
export const useToggleDishActive = () => {
  return $api.useMutation("get", "/api/dish/toggle-active/{id}");
};

/**
 * Hook for toggling dish public status
 * Uses GET /api/dish/toggle-public/{id} endpoint
 */
export const useToggleDishPublic = () => {
  return $api.useMutation("get", "/api/dish/toggle-public/{id}");
};

/**
 * Alias for useGetAllDishes for backward compatibility
 */
export const useAllDishes = useGetAllDishes;

// ==================== ENHANCED MUTATIONS WITH AUTO TOAST ====================

/**
 * Hook for toggling dish active status with automatic toast notifications
 */
export const useToggleDishActiveWithToast = () => {
  const toggleMutation = useToggleDishActive();

  return useMutationHandler({
    mutationFn: (variables: any) => toggleMutation.mutateAsync(variables),
    successMessage: "Đã thay đổi trạng thái món ăn",
    errorMessage: "Không thể thay đổi trạng thái",
  });
};

/**
 * Hook for toggling dish public status with automatic toast notifications
 */
export const useToggleDishPublicWithToast = () => {
  const toggleMutation = useToggleDishPublic();

  return useMutationHandler({
    mutationFn: (variables: any) => toggleMutation.mutateAsync(variables),
    successMessage: "Đã thay đổi trạng thái công khai",
    errorMessage: "Không thể thay đổi trạng thái công khai",
  });
};

// ==================== DISH TEMPLATE API HOOKS ====================

/**







 * Hook for getting all dish templates







 * Uses GET /api/dish-template endpoint







 */

export const useDishTemplates = () => {
  return $api.useQuery("get", "/api/dish-template", {});
};

/**















 * Get a dish template by size code















 * GET /api/dish-template/{sizeCode}















 */

export const useGetDishTemplateBySizeCode = (sizeCode: "S" | "M" | "L") => {
  return $api.useQuery("get", "/api/dish-template/{sizeCode}", {
    params: { path: { sizeCode } },

    enabled: !!sizeCode,
  });
};

// POST /api/dish-template

export const useCreateDishTemplate = () => {
  return $api.useMutation("post", "/api/dish-template");
};

// DELETE /api/dish-template/{sizeCode}

export const useDeleteDishTemplate = () => {
  return $api.useMutation("delete", "/api/dish-template/{sizeCode}");
};

export const transformCartItemToDishCreateRequest = (
  item: CartItem,

  user: AuthLoginData
): DishCreateRequest => {
  const ingredients: Record<string, number> = {};

  (item.recipe || []).forEach((r) => {
    if (!r) return;

    if (r.sourceType === "REMOVED") return;

    const key = String(r.ingredientId || 0);

    const qty = r.quantity || 0;

    ingredients[key] = (ingredients[key] || 0) + qty;
  });

  return {
    id: undefined,

    name: item.name || "Custom Bowl",

    description: undefined,

    price: item.price || 0,

    account: {
      id: user.userId,

      name: user.name || "",

      role: "USER",

      mail: "",
    } as any,

    dishType: "CUSTOM",

    ingredients,

    usedQuantity: undefined,

    public: false,

    active: true,
  } as DishCreateRequest;
};
