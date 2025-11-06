import { $api } from "@/libs/api";
import { useMutationHandler } from "@/hooks/useMutationHandler";

// ==================== INGREDIENT API HOOKS ====================

/**
 * Hook for getting all ingredients
 * Uses GET /api/ingredient endpoint
 */
export const useIngredients = () => {
  return $api.useQuery("get", "/api/ingredient", {});
};

/**
 * Hook for getting ingredient by ID
 * Uses GET /api/ingredient/{id} endpoint
 */
export const useGetIngredientById = (id: number) => {
  return $api.useQuery("get", "/api/ingredient/{id}", {
    params: { path: { id } },
    enabled: !!id,
  });
};

/**
 * Hook for searching ingredients by name
 * Uses GET /api/ingredient/search endpoint
 */
export const useSearchIngredients = (name: string) => {
  return $api.useQuery("get", "/api/ingredient/search", {
    params: { query: { name } },
    enabled: !!name,
  });
};

/**
 * Hook for creating a new ingredient
 * Uses POST /api/ingredient endpoint
 */
export const useCreateIngredient = () => {
  return $api.useMutation("post", "/api/ingredient");
};

/**
 * Hook for updating an existing ingredient
 * Uses PUT /api/ingredient endpoint
 */
export const useUpdateIngredient = () => {
  return $api.useMutation("put", "/api/ingredient");
};

// DELETE operation removed - use toggle active status instead

/**
 * Hook for toggling ingredient active status
 * Uses GET /api/ingredient/toggle-active/{id} endpoint
 */
export const useToggleIngredientActive = () => {
  return $api.useMutation("get", "/api/ingredient/toggle-active/{id}");
};

// ==================== ENHANCED MUTATIONS WITH AUTO TOAST ====================

/**
 * Hook for creating ingredient with automatic toast notifications
 */
export const useCreateIngredientWithToast = () => {
  const createMutation = useCreateIngredient();
  
  return useMutationHandler({
    mutationFn: (variables: any) => createMutation.mutateAsync(variables),
    successMessage: "Tạo nguyên liệu thành công",
    errorMessage: "Không thể tạo nguyên liệu",
  });
};

/**
 * Hook for updating ingredient with automatic toast notifications
 */
export const useUpdateIngredientWithToast = () => {
  const updateMutation = useUpdateIngredient();
  
  return useMutationHandler({
    mutationFn: (variables: any) => updateMutation.mutateAsync(variables),
    successMessage: "Cập nhật nguyên liệu thành công",
    errorMessage: "Không thể cập nhật nguyên liệu",
  });
};

// DELETE operation removed - use toggle active status instead

/**
 * Hook for toggling ingredient active status with automatic toast notifications
 */
export const useToggleIngredientActiveWithToast = () => {
  const toggleMutation = useToggleIngredientActive();
  
  return useMutationHandler({
    mutationFn: (variables: any) => toggleMutation.mutateAsync(variables),
    successMessage: "Đã thay đổi trạng thái nguyên liệu",
    errorMessage: "Không thể thay đổi trạng thái",
  });
};
