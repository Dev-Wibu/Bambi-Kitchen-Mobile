import { useAuthStore } from "@/stores/authStore";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export class ChatError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public shouldRetry: boolean = false
  ) {
    super(message);
    this.name = "ChatError";
  }
}

/**
 * Chat with Gemini AI using /api/gemini/chat endpoint
 * Backend returns plain text response (not JSON), similar to /api/user/login
 * Returns AI response as string
 */
export async function chatWithGemini(message: string): Promise<string> {
  try {
    console.log("🔵 [Gemini Chat] Sending message:", message);

    // Get JWT token from auth store
    const token = useAuthStore.getState().token;
    console.log("🔑 [Gemini Chat] Has token:", !!token);

    // Use raw fetch to get plain text response (backend doesn't return JSON)
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://bambi.kdz.asia";
    const url = new URL("/api/gemini/chat", API_BASE_URL);
    url.searchParams.append("message", message);

    console.log("🔵 [Gemini Chat] Request URL:", url.toString());

    const headers: HeadersInit = {
      "Content-Type": "text/plain",
      Accept: "text/plain, */*",
    };

    // Add JWT token if available
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    console.log("🟢 [Gemini Chat] Response status:", response.status);
    console.log(
      "🟢 [Gemini Chat] Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [Gemini Chat] Error response body:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    // Backend returns plain text, not JSON
    const text = await response.text();
    console.log("✅ [Gemini Chat] Plain text response:", text);

    if (!text || text.trim() === "") {
      console.warn("⚠️ [Gemini Chat] Empty response from backend");
      return "Xin lỗi, tôi không nhận được phản hồi từ AI.";
    }

    return text.trim();
  } catch (error: any) {
    console.error("❌ [Gemini Chat] Error caught:", error);
    console.error("❌ [Gemini Chat] Error message:", error?.message);
    console.error("❌ [Gemini Chat] Error stack:", error?.stack);
    const status = error?.status || error?.response?.status;
    const shouldRetry = status === 500 || status === 503;

    let errorMessage = "Không thể kết nối với AI. Vui lòng thử lại sau.";

    if (status === 500) {
      errorMessage = "Máy chủ AI đang gặp sự cố. Vui lòng thử lại sau.";
    } else if (status === 503) {
      errorMessage = "Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.";
    } else if (status === 401 || status === 403) {
      errorMessage = "Bạn không có quyền sử dụng tính năng này. Vui lòng đăng nhập lại.";
    } else if (error?.message) {
      errorMessage = error.message;
    }

    throw new ChatError(errorMessage, status, shouldRetry);
  }
}
