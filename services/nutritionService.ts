import { $api } from "@/libs/api";
import type { components } from "@/schema-from-be";

// ==================== TYPE DEFINITIONS ====================

type Nutrition = components["schemas"]["Nutrition"];
type Ingredient = components["schemas"]["Ingredient"];

// ==================== NUTRITION API HOOKS ====================

/**
 * Hook to get nutrition by ID
 * Uses GET /api/nutrition endpoint with query parameter
 * @param id - The nutrition ID
 * @param enabled - Optional flag to enable/disable the query
 */
export const useNutrition = (id: number, enabled = true) => {
  return $api.useQuery("get", "/api/nutrition", {
    params: { query: { id } },
    enabled: !!id && enabled,
  });
};

/**
 * Hook to get nutrition by ingredient ID
 * Uses GET /api/nutrition/{ingredientId}/ingredient endpoint
 * @param ingredientId - The ingredient ID
 * @param enabled - Optional flag to enable/disable the query
 */
export const useNutritionByIngredient = (ingredientId: number, enabled = true) => {
  return $api.useQuery("get", "/api/nutrition/{ingredientId}/ingredient", {
    params: { path: { ingredientId } },
    enabled: !!ingredientId && enabled,
  });
};

/**
 * Hook to create new nutrition entry
 * Uses POST /api/nutrition endpoint
 *
 * @example
 * const createNutrition = useCreateNutrition();
 * await createNutrition.mutateAsync({
 *   body: {
 *     ingredient: { id: 1 },
 *     calories: 150,
 *     protein: 5.5,
 *     carb: 20.0,
 *     fiber: 3.0,
 *     // ... other nutrition fields
 *   }
 * });
 */
export const useCreateNutrition = () => {
  return $api.useMutation("post", "/api/nutrition");
};

/**
 * Hook to update existing nutrition entry
 * Uses PUT /api/nutrition endpoint
 *
 * @example
 * const updateNutrition = useUpdateNutrition();
 * await updateNutrition.mutateAsync({
 *   body: {
 *     id: 1,
 *     calories: 200,
 *     protein: 8.0,
 *     // ... updated fields
 *   }
 * });
 */
export const useUpdateNutrition = () => {
  return $api.useMutation("put", "/api/nutrition");
};

// ==================== TRANSFORM HELPERS ====================

/**
 * Transform nutrition form data to API request format
 * @param formData - Form data from UI
 * @param ingredientId - The ingredient ID to associate with
 */
export const transformNutritionCreateRequest = (formData: any, ingredientId: number): Nutrition => {
  return {
    ingredient: { id: ingredientId } as Ingredient,
    calories: Number(formData.calories) || 0,
    protein: Number(formData.protein) || 0,
    carb: Number(formData.carb) || 0,
    fiber: Number(formData.fiber) || 0,
    iron: Number(formData.iron) || 0,
    sodium: Number(formData.sodium) || 0,
    calcium: Number(formData.calcium) || 0,
    sugar: Number(formData.sugar) || 0,
    sat_fat: Number(formData.sat_fat) || 0,
    per_unit: formData.per_unit || "100g",
  };
};

/**
 * Transform nutrition update data
 * @param nutritionId - The nutrition entry ID
 * @param formData - Updated form data
 */
export const transformNutritionUpdateRequest = (nutritionId: number, formData: any): Nutrition => {
  return {
    id: nutritionId,
    calories: Number(formData.calories) || 0,
    protein: Number(formData.protein) || 0,
    carb: Number(formData.carb) || 0,
    fiber: Number(formData.fiber) || 0,
    iron: Number(formData.iron) || 0,
    sodium: Number(formData.sodium) || 0,
    calcium: Number(formData.calcium) || 0,
    sugar: Number(formData.sugar) || 0,
    sat_fat: Number(formData.sat_fat) || 0,
    per_unit: formData.per_unit || "100g",
  };
};

/**
 * Calculate total nutrition for multiple ingredients
 * @param nutritionData - Array of nutrition entries with quantities
 */
export const calculateTotalNutrition = (
  nutritionData: { nutrition: Nutrition; quantity: number }[]
) => {
  return nutritionData.reduce(
    (total, { nutrition, quantity }) => {
      const multiplier = quantity / 100; // Assuming per_unit is 100g
      return {
        calories: total.calories + (nutrition.calories || 0) * multiplier,
        protein: total.protein + (nutrition.protein || 0) * multiplier,
        carb: total.carb + (nutrition.carb || 0) * multiplier,
        fiber: total.fiber + (nutrition.fiber || 0) * multiplier,
        iron: total.iron + (nutrition.iron || 0) * multiplier,
        sodium: total.sodium + (nutrition.sodium || 0) * multiplier,
        calcium: total.calcium + (nutrition.calcium || 0) * multiplier,
        sugar: total.sugar + (nutrition.sugar || 0) * multiplier,
        sat_fat: total.sat_fat + (nutrition.sat_fat || 0) * multiplier,
      };
    },
    {
      calories: 0,
      protein: 0,
      carb: 0,
      fiber: 0,
      iron: 0,
      sodium: 0,
      calcium: 0,
      sugar: 0,
      sat_fat: 0,
    }
  );
};

/**
 * Format nutrition display text
 * @param nutrition - Nutrition data
 */
export const formatNutritionText = (nutrition: Nutrition) => {
  return {
    calories: `${nutrition.calories || 0} kcal`,
    protein: `${nutrition.protein?.toFixed(1) || 0}g`,
    carb: `${nutrition.carb?.toFixed(1) || 0}g`,
    fiber: `${nutrition.fiber?.toFixed(1) || 0}g`,
    iron: `${nutrition.iron?.toFixed(1) || 0}mg`,
    sodium: `${nutrition.sodium?.toFixed(1) || 0}mg`,
    calcium: `${nutrition.calcium?.toFixed(1) || 0}mg`,
    sugar: `${nutrition.sugar?.toFixed(1) || 0}g`,
    sat_fat: `${nutrition.sat_fat?.toFixed(1) || 0}g`,
  };
};
