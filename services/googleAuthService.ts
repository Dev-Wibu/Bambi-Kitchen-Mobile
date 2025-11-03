import type { AuthLoginData } from "@/interfaces/auth.interface";
import { API_BASE_URL, fetchClient } from "@/libs/api";
import { extractRole } from "@/services/accountService";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

/**
 * Google OAuth Authentication Service
 * Handles Google login flow for mobile app
 */

export interface GoogleAuthResult {
  success: boolean;
  authData?: AuthLoginData;
  error?: string;
}

/**
 * Configuration for Google OAuth
 */
const GOOGLE_AUTH_CONFIG = {
  scheme: "fe",
  path: "oauth2/callback",
  preferLocalhost: false, // Don't use localhost on mobile
};

/**
 * Prepares the WebBrowser for OAuth session
 * CRITICAL: Must be called BEFORE opening the auth session on iOS
 */
export const prepareGoogleAuth = () => {
  WebBrowser.maybeCompleteAuthSession();
};

/**
 * Generates the redirect URI for OAuth callback
 * @returns The redirect URI (exp://... for Expo Go, fe://... for standalone)
 */
export const generateRedirectUri = (): string => {
  const redirectUrl = makeRedirectUri({
    scheme: GOOGLE_AUTH_CONFIG.scheme,
    path: GOOGLE_AUTH_CONFIG.path,
    preferLocalhost: GOOGLE_AUTH_CONFIG.preferLocalhost,
  });

  console.log("📍 Generated redirect URI:", redirectUrl);
  return redirectUrl;
};

/**
 * Constructs the Google OAuth URL with redirect parameter
 * @param redirectUri - The redirect URI to use after authentication
 * @returns Full Google OAuth URL
 */
export const buildGoogleAuthUrl = (redirectUri: string): string => {
  const googleAuthUrl = `${API_BASE_URL}/api/user/login-with-google?redirect_uri=${encodeURIComponent(redirectUri)}`;
  console.log("🔗 Google OAuth URL:", googleAuthUrl);
  return googleAuthUrl;
};

/**
 * Opens the Google OAuth session in a browser
 * @param authUrl - The Google OAuth URL
 * @param redirectUrl - The redirect URI for callback
 * @returns WebBrowser result
 */
export const openGoogleAuthSession = async (
  authUrl: string,
  redirectUrl: string
): Promise<WebBrowser.WebBrowserAuthSessionResult> => {
  console.log("🌐 Opening Google OAuth session...");

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl, {
    showInRecents: true, // Show in recent apps on Android
    createTask: false, // Don't create a new task (better for back button behavior)
  });

  console.log("📱 OAuth result type:", result.type);
  return result;
};

/**
 * Extracts token from OAuth redirect URL
 * @param url - The redirect URL containing the token
 * @returns JWT token or null if not found
 */
export const extractTokenFromUrl = (url: string): string | null => {
  try {
    console.log("🔍 Extracting token from URL:", url);

    const urlObj = new URL(url);
    const token = urlObj.searchParams.get("token");

    console.log("🎫 Token extracted:", token ? "✅ Yes" : "❌ No");
    return token;
  } catch (error) {
    console.error("❌ Failed to extract token:", error);
    return null;
  }
};

/**
 * Fetches user information using JWT token
 * @param token - JWT token
 * @returns User authentication data
 */
export const fetchUserInfo = async (token: string): Promise<AuthLoginData | null> => {
  try {
    console.log("👤 Fetching user info...");

    const userInfoResponse = await fetchClient.GET("/api/user/me");

    if (userInfoResponse.data) {
      const userData = userInfoResponse.data as any;
      const userId = userData.id || 0;
      const name = userData.name || "";
      const role = userData.role;

      const authData: AuthLoginData = {
        userId: userId,
        name: name,
        role: extractRole(Array.isArray(role) ? role : [role]),
      };

      console.log("✅ User info fetched successfully:", name, `(${authData.role})`);
      return authData;
    }

    console.error("❌ No user data in response");
    return null;
  } catch (error) {
    console.error("❌ Failed to fetch user info:", error);
    return null;
  }
};

/**
 * Main Google login function
 * Orchestrates the entire OAuth flow
 * @param setToken - Function to store JWT token
 * @returns GoogleAuthResult with success status and auth data or error
 */
export const loginWithGoogle = async (
  setToken: (token: string) => void
): Promise<GoogleAuthResult> => {
  try {
    // Step 1: Prepare WebBrowser (critical for iOS)
    prepareGoogleAuth();

    // Step 2: Generate redirect URI
    const redirectUrl = generateRedirectUri();

    // Step 3: Build Google OAuth URL
    const googleAuthUrl = buildGoogleAuthUrl(redirectUrl);

    // Step 4: Open OAuth session in browser
    const result = await openGoogleAuthSession(googleAuthUrl, redirectUrl);

    // Step 5: Handle different result types
    if (result.type === "success") {
      if (!result.url) {
        console.error("❌ Success result but no URL");
        return {
          success: false,
          error: "No redirect URL received",
        };
      }

      // Step 6: Extract token from redirect URL
      const token = extractTokenFromUrl(result.url);

      if (!token) {
        return {
          success: false,
          error: "No token received from OAuth provider",
        };
      }

      // Step 7: Store token
      setToken(token);

      // Step 8: Fetch user info
      const authData = await fetchUserInfo(token);

      if (!authData) {
        return {
          success: false,
          error: "Failed to fetch user information",
        };
      }

      console.log("🎉 Google login successful!");
      return {
        success: true,
        authData,
      };
    } else if (result.type === "cancel") {
      console.log("⚠️ User cancelled Google login");
      return {
        success: false,
        error: "Google login was cancelled",
      };
    } else if (result.type === "dismiss") {
      console.log("⚠️ Browser was dismissed");
      return {
        success: false,
        error: "Browser was dismissed",
      };
    } else if (result.type === "locked") {
      console.log("⚠️ Another auth session is in progress");
      return {
        success: false,
        error: "Another authentication is in progress",
      };
    }

    return {
      success: false,
      error: "Authentication failed - unknown result type",
    };
  } catch (error) {
    console.error("❌ Google login error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Warm up the browser for faster OAuth (optional optimization)
 */
export const warmUpBrowser = async (): Promise<void> => {
  try {
    await WebBrowser.warmUpAsync();
    console.log("✅ Browser warmed up");
  } catch (error) {
    console.warn("⚠️ Failed to warm up browser:", error);
  }
};

/**
 * Cool down the browser after OAuth (cleanup)
 */
export const coolDownBrowser = async (): Promise<void> => {
  try {
    await WebBrowser.coolDownAsync();
    console.log("✅ Browser cooled down");
  } catch (error) {
    console.warn("⚠️ Failed to cool down browser:", error);
  }
};
