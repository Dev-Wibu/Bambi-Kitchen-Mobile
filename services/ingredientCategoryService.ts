import { useMutationHandler } from "@/hooks/useMutationHandler";
import type {
  IngredientCategoryCreateRequest,
  IngredientCategoryUpdateRequest,
} from "@/interfaces/ingredientCategory.interface";
import { $api } from "@/libs/api";

// ==================== INGREDIENT CATEGORY API HOOKS ====================

/**
 * Hook for getting all ingredient categories
 * Uses GET /api/ingredient-category endpoint
 */
export const useIngredientCategories = () => {
  return $api.useQuery("get", "/api/ingredient-category", {});
};

/**
 * Hook for getting ingredient category by ID
 * Uses GET /api/ingredient-category/{id} endpoint
 */
export const useGetIngredientCategoryById = (id: number) => {
  return $api.useQuery("get", "/api/ingredient-category/{id}", {
    params: { path: { id } },
    enabled: !!id,
  });
};

/**
 * Hook for creating a new ingredient category
 * Uses POST /api/ingredient-category endpoint
 */
export const useCreateIngredientCategory = () => {
  return $api.useMutation("post", "/api/ingredient-category");
};

/**
 * Hook for updating an existing ingredient category
 * Uses PUT /api/ingredient-category endpoint
 */
export const useUpdateIngredientCategory = () => {
  return $api.useMutation("put", "/api/ingredient-category");
};

// DELETE operation removed - categories should not be deleted to maintain data integrity

// ==================== ENHANCED MUTATIONS WITH AUTO TOAST ====================

/**
 * Hook for creating ingredient category with automatic toast notifications
 */
export const useCreateIngredientCategoryWithToast = () => {
  const createMutation = useCreateIngredientCategory();

  return useMutationHandler({
    mutationFn: (variables: any) => createMutation.mutateAsync(variables),
    successMessage: "Tạo danh mục thành công",
    errorMessage: "Không thể tạo danh mục",
  });
};

/**
 * Hook for updating ingredient category with automatic toast notifications
 */
export const useUpdateIngredientCategoryWithToast = () => {
  const updateMutation = useUpdateIngredientCategory();

  return useMutationHandler({
    mutationFn: (variables: any) => updateMutation.mutateAsync(variables),
    successMessage: "Cập nhật danh mục thành công",
    errorMessage: "Không thể cập nhật danh mục",
  });
};

// DELETE operation removed - categories should not be deleted

// ==================== TRANSFORM FUNCTIONS ====================

/**
 * Transform ingredient category form data to create request format
 */
export const transformIngredientCategoryCreateRequest = (data: {
  name: string;
  description?: string;
}): IngredientCategoryCreateRequest => {
  return {
    name: data.name,
    description: data.description,
  };
};

/**
 * Transform ingredient category form data to update request format
 */
export const transformIngredientCategoryUpdateRequest = (data: {
  id: number;
  name: string;
  description?: string;
}): IngredientCategoryUpdateRequest => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
  };
};
