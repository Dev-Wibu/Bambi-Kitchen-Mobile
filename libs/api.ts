import type { paths } from "@/schema-from-be";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

// Get the API base URL from environment or use default
// Note: Do not include /api suffix here as it's already in the endpoint paths
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://bambi.kdz.asia";

// Create the fetch client with base configuration
const fetchClient = createFetchClient<paths>({
  baseUrl: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add middleware to include JWT token in Authorization header
fetchClient.use({
  async onRequest({ request }) {
    // Dynamically import to avoid circular dependency
    const { useAuthStore } = await import("@/stores/authStore");
    const token = useAuthStore.getState().token;

    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }

    return request;
  },
});

// Create the React Query client
export const $api = createClient(fetchClient);

// Export the fetch client for direct use if needed
export { fetchClient };
