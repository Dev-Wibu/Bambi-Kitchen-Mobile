import type { components } from "@/schema-from-be";

// Ingredient type from BE schema
export type Ingredient = components["schemas"]["Ingredient"];

// Ingredient create request from BE schema
export type IngredientCreateRequest = components["schemas"]["IngredientCreateRequest"];

// Ingredient update request from BE schema
export type IngredientUpdateRequest = components["schemas"]["IngredientUpdateRequest"];

// Ingredient unit enum
export type IngredientUnit = "GRAM" | "KILOGRAM" | "LITER" | "PCS";
