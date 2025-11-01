import { $api } from "@/libs/api";

// ==================== GEMINI API HOOKS ====================

/**
 * Hook for chatting with Gemini
 * Uses GET /api/gemini/chat endpoint
 */
export const useGeminiChat = (message: string) => {
  return $api.useQuery("get", "/api/gemini/chat", {
    params: { query: { message } },
    enabled: !!message,
  });
};

/**
 * Hook for agent chat with Gemini
 * Uses POST /api/gemini/agent endpoint
 */
export const useGeminiAgentChat = () => {
  return $api.useMutation("post", "/api/gemini/agent");
};
