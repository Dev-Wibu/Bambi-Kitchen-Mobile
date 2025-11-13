// NOTE: Dish Category endpoints are not available in the backend API
// This entire service is commented out because the backend schema doesn't include:
// - /api/dish-category (GET, POST, PUT)
// - /api/dish-category/{id} (GET)
//
// If you need dish categories, please:
// 1. Add the endpoints to the backend
// 2. Regenerate schema-from-be.d.ts
// 3. Uncomment this file

/*
import { useMutationHandler } from "@/hooks/useMutationHandler";
import type {
  DishCategoryCreateRequest,
  DishCategoryUpdateRequest,
} from "@/interfaces/dishCategory.interface";
import { $api } from "@/libs/api";

// ==================== DISH CATEGORY API HOOKS ====================

/**
 * Hook for getting all dish categories
 * Uses GET /api/dish-category endpoint
 *\/
export const useDishCategories = () => {
  return $api.useQuery("get", "/api/dish-category", {});
};

/**
 * Hook for getting dish category by ID
 * Uses GET /api/dish-category/{id} endpoint
 *\/
export const useGetDishCategoryById = (id: number) => {
  return $api.useQuery("get", "/api/dish-category/{id}", {
    params: { path: { id } },
    enabled: !!id,
  });
};

/**
 * Hook for creating a new dish category
 * Uses POST /api/dish-category endpoint
 *\/
export const useCreateDishCategory = () => {
  return $api.useMutation("post", "/api/dish-category");
};

/**
 * Hook for updating an existing dish category
 * Uses PUT /api/dish-category endpoint
 *\/
export const useUpdateDishCategory = () => {
  return $api.useMutation("put", "/api/dish-category");
};

// DELETE operation removed - categories should not be deleted to maintain data integrity

// ==================== ENHANCED MUTATIONS WITH AUTO TOAST ====================

/**
 * Hook for creating dish category with automatic toast notifications
 *\/
export const useCreateDishCategoryWithToast = () => {
  const createMutation = useCreateDishCategory();

  return useMutationHandler({
    mutationFn: (variables: any) => createMutation.mutateAsync(variables),
    successMessage: "Tạo danh mục món ăn thành công",
    errorMessage: "Không thể tạo danh mục món ăn",
  });
};

/**
 * Hook for updating dish category with automatic toast notifications
 *\/
export const useUpdateDishCategoryWithToast = () => {
  const updateMutation = useUpdateDishCategory();

  return useMutationHandler({
    mutationFn: (variables: any) => updateMutation.mutateAsync(variables),
    successMessage: "Cập nhật danh mục món ăn thành công",
    errorMessage: "Không thể cập nhật danh mục món ăn",
  });
};

// DELETE operation removed - categories should not be deleted

// ==================== TRANSFORM FUNCTIONS ====================

/**
 * Transform dish category form data to create request format
 *\/
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
 *\/
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
*/
