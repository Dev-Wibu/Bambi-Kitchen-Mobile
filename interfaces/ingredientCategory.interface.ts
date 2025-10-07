import type { components } from "@/schema-from-be";

// IngredientCategory type from BE schema
export type IngredientCategory = components["schemas"]["IngredientCategory"];

// For create/update operations, we can use the IngredientCategory type directly
export type IngredientCategoryCreateRequest = Omit<IngredientCategory, "id">;
export type IngredientCategoryUpdateRequest = IngredientCategory;
