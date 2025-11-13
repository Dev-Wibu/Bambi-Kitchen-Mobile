import { $api } from "@/libs/api";
import type { components } from "@/schema-from-be";

// ==================== TYPE DEFINITIONS ====================

type ChatRequest = components["schemas"]["ChatRequest"];
type DishNutritionResponseObject = components["schemas"]["DishNutritionResponseObject"];

// ==================== GEMINI API HOOKS ====================

/**
 * Hook for simple chat with Gemini
 * Uses GET /api/gemini/chat endpoint
 * @param message - The message to send to Gemini
 * @param enabled - Optional flag to enable/disable the query
 */
export const useGeminiChat = (message: string, enabled = true) => {
  return $api.useQuery("get", "/api/gemini/chat", {
    params: { query: { message } },
    enabled: !!message && enabled,
  });
};

/**
 * Hook for agent chat with Gemini (more advanced)
 * Uses POST /api/gemini/agent endpoint
 * Returns mutation for sending chat requests with ChatRequest body
 *
 * @example
 * const agentChat = useGeminiAgentChat();
 * await agentChat.mutateAsync({
 *   body: { message: "Hello, Gemini!" }
 * });
 */
export const useGeminiAgentChat = () => {
  return $api.useMutation("post", "/api/gemini/agent");
};

/**
 * Hook for calculating calories from dish IDs
 * Uses POST /api/gemini/calculate-calories endpoint
 * Takes an array of dish IDs and returns nutrition information
 *
 * @example
 * const calcCalories = useCalculateCalories();
 * const result = await calcCalories.mutateAsync({
 *   body: [1, 2, 3] // array of dish IDs
 * });
 * // Returns DishNutritionResponseObject[] with nutrition info
 */
export const useCalculateCalories = () => {
  return $api.useMutation("post", "/api/gemini/calculate-calories");
};

// ==================== TRANSFORM HELPERS ====================

/**
 * Transform chat request data
 */
export const transformChatRequest = (message: string): ChatRequest => {
  return { message };
};

/**
 * Extract nutrition data from response
 */
export const extractNutritionData = (response: DishNutritionResponseObject) => {
  return {
    dishId: response.dishId,
    data: response.response,
  };
};
