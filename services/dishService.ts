import { $api } from "@/libs/api";

// ==================== DISH API HOOKS ====================

/**
 * Hook for creating/updating a dish
 * Uses POST /api/dish endpoint
 * Note: API does not have GET endpoint for dishes list
 */
export const useCreateDish = () => {
  return $api.useMutation("post", "/api/dish");
};

// ==================== DISH TEMPLATE API HOOKS ====================

/**
 * Hook for getting all dish templates
 * Uses GET /api/dish-templates endpoint
 */
export const useDishTemplates = () => {
  return $api.useQuery("get", "/api/dish-templates", {});
};

/**
 * Hook for getting dish template by size code
 * Uses GET /api/dish-templates/{sizeCode} endpoint
 */
export const useGetDishTemplateBySizeCode = (sizeCode: "S" | "M" | "L") => {
  return $api.useQuery("get", "/api/dish-templates/{sizeCode}", {
    params: { path: { sizeCode } },
    enabled: !!sizeCode,
  });
};

/**
 * Hook for creating a dish template
 * Uses POST /api/dish-templates endpoint
 */
export const useCreateDishTemplate = () => {
  return $api.useMutation("post", "/api/dish-templates");
};

/**
 * Hook for deleting a dish template
 * Uses DELETE /api/dish-templates/{sizeCode} endpoint
 */
export const useDeleteDishTemplate = () => {
  return $api.useMutation("delete", "/api/dish-templates/{sizeCode}");
};
