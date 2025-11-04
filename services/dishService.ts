import { $api } from "@/libs/api";
import { useMutationHandler } from "@/hooks/useMutationHandler";

// ==================== DISH API HOOKS ====================

/**
 * Hook for getting all dishes (menu - only active and public)
 * Uses GET /api/dish endpoint
 */
export const useDishes = () => {
  return $api.useQuery("get", "/api/dish", {});
};

/**
 * Hook for getting all dishes for admin (includes inactive and private dishes)
 * Uses GET /api/dish/get-all endpoint
 * This endpoint should be used in the dish management page
 */
export const useAllDishes = () => {
  return $api.useQuery("get", "/api/dish/get-all", {});
};

/**
 * Hook for getting dish by ID
 * Uses GET /api/dish/{id} endpoint
 */
export const useGetDishById = (id: number) => {
  return $api.useQuery("get", "/api/dish/{id}", {
    params: { path: { id } },
    enabled: !!id,
  });
};

/**
 * Hook for getting dishes by account ID
 * Uses GET /api/dish/account/{accountId} endpoint
 */
export const useGetDishesByAccountId = (accountId: number) => {
  return $api.useQuery("get", "/api/dish/account/{accountId}", {
    params: { path: { accountId } },
    enabled: !!accountId,
  });
};

/**
 * Hook for creating/updating a dish
 * Uses POST /api/dish endpoint
 */
export const useCreateDish = () => {
  return $api.useMutation("post", "/api/dish");
};

/**
 * Hook for updating an existing dish
 * Uses PUT /api/dish endpoint
 */
export const useUpdateDish = () => {
  return $api.useMutation("put", "/api/dish");
};

/**
 * Hook for saving a custom dish
 * Uses PUT /api/dish/save-custom-dish endpoint
 */
export const useSaveCustomDish = () => {
  return $api.useMutation("put", "/api/dish/save-custom-dish");
};

/**
 * Hook for toggling dish public status
 * Uses GET /api/dish/toggle-public/{id} endpoint
 */
export const useToggleDishPublic = () => {
  return $api.useMutation("get", "/api/dish/toggle-public/{id}");
};

/**
 * Hook for toggling dish active status
 * Uses GET /api/dish/toggle-active/{id} endpoint
 */
export const useToggleDishActive = () => {
  return $api.useMutation("get", "/api/dish/toggle-active/{id}");
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
 * Hook for getting dish template by size code
 * Uses GET /api/dish-template/{sizeCode} endpoint
 */
export const useGetDishTemplateBySizeCode = (sizeCode: "S" | "M" | "L") => {
  return $api.useQuery("get", "/api/dish-template/{sizeCode}", {
    params: { path: { sizeCode } },
    enabled: !!sizeCode,
  });
};

/**
 * Hook for creating a dish template
 * Uses POST /api/dish-template endpoint
 */
export const useCreateDishTemplate = () => {
  return $api.useMutation("post", "/api/dish-template");
};

/**
 * Hook for deleting a dish template
 * Uses DELETE /api/dish-template/{sizeCode} endpoint
 */
export const useDeleteDishTemplate = () => {
  return $api.useMutation("delete", "/api/dish-template/{sizeCode}");
};

// ==================== ENHANCED MUTATIONS WITH AUTO TOAST ====================

/**
 * Hook for creating/updating dish with automatic toast notifications
 */
export const useCreateDishWithToast = () => {
  const createMutation = useCreateDish();
  
  return useMutationHandler({
    mutationFn: (variables: any) => createMutation.mutateAsync(variables),
    successMessage: "Lưu món ăn thành công",
    errorMessage: "Không thể lưu món ăn",
  });
};

/**
 * Hook for updating dish with automatic toast notifications
 */
export const useUpdateDishWithToast = () => {
  const updateMutation = useUpdateDish();
  
  return useMutationHandler({
    mutationFn: (variables: any) => updateMutation.mutateAsync(variables),
    successMessage: "Cập nhật món ăn thành công",
    errorMessage: "Không thể cập nhật món ăn",
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
    errorMessage: "Không thể thay đổi trạng thái",
  });
};

/**
 * Hook for toggling dish active status with automatic toast notifications
 */
export const useToggleDishActiveWithToast = () => {
  const toggleMutation = useToggleDishActive();
  
  return useMutationHandler({
    mutationFn: (variables: any) => toggleMutation.mutateAsync(variables),
    successMessage: "Đã thay đổi trạng thái hoạt động",
    errorMessage: "Không thể thay đổi trạng thái",
  });
};
