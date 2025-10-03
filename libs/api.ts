import type { paths } from "@/schema-from-be";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

// Get the API base URL from environment or use default
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://bambi.kdz.asia/api";

// Create the fetch client with base configuration
const fetchClient = createFetchClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: "include", // Important for session-based auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Create the React Query client
export const $api = createClient(fetchClient);

// Export the fetch client for direct use if needed
export { fetchClient };
