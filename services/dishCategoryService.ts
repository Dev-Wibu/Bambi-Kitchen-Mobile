import type {
  DishCategoryCreateRequest,
  DishCategoryUpdateRequest,
} from "@/interfaces/dishCategory.interface";
import { $api } from "@/libs/api";

// ==================== DISH CATEGORY API HOOKS ====================

/**
 * Hook for getting all dish categories
 * Uses GET /api/dish-category endpoint
 */
export const useDishCategories = () => {
  return $api.useQuery("get", "/api/dish-category", {});
};

/**
 * Hook for getting dish category by ID
 * Uses GET /api/dish-category/{id} endpoint
 */
export const useGetDishCategoryById = (id: number) => {
  return $api.useQuery("get", "/api/dish-category/{id}", {
    params: { path: { id } },
    enabled: !!id,
  });
};

/**
 * Hook for creating a new dish category
 * Uses POST /api/dish-category endpoint
 */
export const useCreateDishCategory = () => {
  return $api.useMutation("post", "/api/dish-category");
};

/**
 * Hook for updating an existing dish category
 * Uses PUT /api/dish-category endpoint
 */
export const useUpdateDishCategory = () => {
  return $api.useMutation("put", "/api/dish-category");
};

/**
 * Hook for deleting a dish category
 * Uses DELETE /api/dish-category/{id} endpoint
 */
export const useDeleteDishCategory = () => {
  return $api.useMutation("delete", "/api/dish-category/{id}");
};

// ==================== TRANSFORM FUNCTIONS ====================

/**
 * Transform dish category form data to create request format
 */
export const transformDishCategoryCreateRequest = (data: {
  name: string;
  description?: string;
}): DishCategoryCreateRequest => {
  return {
    name: data.name,
    description: data.description,
  };
};

/**
 * Transform dish category form data to update request format
 */
export const transformDishCategoryUpdateRequest = (data: {
  id: number;
  name: string;
  description?: string;
}): DishCategoryUpdateRequest => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
  };
};
