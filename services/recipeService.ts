import { $api } from "@/libs/api";

// ==================== RECIPE API HOOKS ====================

/**
 * Hook for getting all recipes
 * Uses GET /api/recipe endpoint
 */
export const useRecipes = () => {
  return $api.useQuery("get", "/api/recipe", {});
};

/**
 * Hook for getting recipes by dish ID
 * Uses GET /api/recipe/by-dish/{id} endpoint
 */
export const useGetRecipesByDishId = (id: number) => {
  return $api.useQuery("get", "/api/recipe/by-dish/{id}", {
    params: { path: { id } },
    enabled: !!id,
  });
};

/**
 * Hook for deleting a recipe
 * Uses DELETE /api/test/demo/delete-recipe endpoint
 */
export const useDeleteRecipe = () => {
  return $api.useMutation("delete", "/api/test/demo/delete-recipe");
};
