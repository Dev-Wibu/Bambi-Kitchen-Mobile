import { $api } from "@/libs/api";

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

/**
 * Hook for deleting an ingredient
 * Uses DELETE /api/ingredient/{id} endpoint
 */
export const useDeleteIngredient = () => {
  return $api.useMutation("delete", "/api/ingredient/{id}");
};

/**
 * Hook for toggling ingredient active status
 * Uses GET /api/ingredient/toggle-active/{id} endpoint
 */
export const useToggleIngredientActive = () => {
  return $api.useMutation("get", "/api/ingredient/toggle-active/{id}");
};
