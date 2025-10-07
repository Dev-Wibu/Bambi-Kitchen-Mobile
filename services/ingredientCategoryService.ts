import type {
  IngredientCategoryCreateRequest,
  IngredientCategoryUpdateRequest,
} from "@/interfaces/ingredientCategory.interface";
import { $api } from "@/libs/api";

// ==================== INGREDIENT CATEGORY API HOOKS ====================

/**
 * Hook for getting all ingredient categories
 * Uses GET /api/ingredient-categories endpoint
 */
export const useIngredientCategories = () => {
  return $api.useQuery("get", "/api/ingredient-categories", {});
};

/**
 * Hook for getting ingredient category by ID
 * Uses GET /api/ingredient-categories/{id} endpoint
 */
export const useGetIngredientCategoryById = (id: number) => {
  return $api.useQuery("get", "/api/ingredient-categories/{id}", {
    params: { path: { id } },
    enabled: !!id,
  });
};

/**
 * Hook for creating a new ingredient category
 * Uses POST /api/ingredient-categories endpoint
 */
export const useCreateIngredientCategory = () => {
  return $api.useMutation("post", "/api/ingredient-categories");
};

/**
 * Hook for updating an existing ingredient category
 * Uses PUT /api/ingredient-categories endpoint
 */
export const useUpdateIngredientCategory = () => {
  return $api.useMutation("put", "/api/ingredient-categories");
};

/**
 * Hook for deleting an ingredient category
 * Uses DELETE /api/ingredient-categories/{id} endpoint
 */
export const useDeleteIngredientCategory = () => {
  return $api.useMutation("delete", "/api/ingredient-categories/{id}");
};

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
