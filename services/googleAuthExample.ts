/**
 * Example: How to use Google Auth Service
 * This file demonstrates various use cases of the Google Authentication Service
 */

import {
  buildGoogleAuthUrl,
  coolDownBrowser,
  extractTokenFromUrl,
  fetchUserInfo,
  generateRedirectUri,
  loginWithGoogle,
  openGoogleAuthSession,
  prepareGoogleAuth,
  warmUpBrowser,
} from "@/services/googleAuthService";
import { useAuthStore } from "@/stores/authStore";

// ============================================================================
// EXAMPLE 1: Basic Usage (Recommended)
// ============================================================================

export const basicGoogleLogin = async () => {
  const { setToken, setUser, setIsLoggedIn } = useAuthStore.getState();

  try {
    // Call the main service function
    const result = await loginWithGoogle(setToken);

    if (result.success && result.authData) {
      // Success! Save user data
      setUser(result.authData);
      setIsLoggedIn(true);

      console.log("✅ Login successful!");
      console.log("User:", result.authData.name);
      console.log("Role:", result.authData.role);

      return result.authData;
    } else {
      // Failed
      console.error("❌ Login failed:", result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("❌ Exception:", error);
    throw error;
  }
};

// ============================================================================
// EXAMPLE 2: With Browser Optimization
// ============================================================================

export const optimizedGoogleLogin = async () => {
  const { setToken } = useAuthStore.getState();

  try {
    // Pre-warm browser for faster loading
    await warmUpBrowser();

    // Perform login
    const result = await loginWithGoogle(setToken);

    // Clean up browser resources
    await coolDownBrowser();

    if (result.success && result.authData) {
      console.log("✅ Optimized login successful!");
      return result.authData;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    // Make sure to clean up even on error
    await coolDownBrowser();
    throw error;
  }
};

// ============================================================================
// EXAMPLE 3: Step-by-Step Custom Flow
// ============================================================================

export const customGoogleLoginFlow = async () => {
  const { setToken } = useAuthStore.getState();

  try {
    // Step 1: Prepare WebBrowser (CRITICAL for iOS)
    console.log("Step 1: Preparing WebBrowser...");
    prepareGoogleAuth();

    // Step 2: Generate redirect URI
    console.log("Step 2: Generating redirect URI...");
    const redirectUrl = generateRedirectUri();
    console.log("Redirect URL:", redirectUrl);

    // Step 3: Build Google OAuth URL
    console.log("Step 3: Building OAuth URL...");
    const authUrl = buildGoogleAuthUrl(redirectUrl);
    console.log("Auth URL:", authUrl);

    // Step 4: Open OAuth session
    console.log("Step 4: Opening browser...");
    const result = await openGoogleAuthSession(authUrl, redirectUrl);
    console.log("Browser result:", result.type);

    // Step 5: Handle result
    if (result.type === "success" && result.url) {
      console.log("Step 5: Processing success result...");

      // Step 6: Extract token
      const token = extractTokenFromUrl(result.url);

      if (!token) {
        throw new Error("No token in redirect URL");
      }

      console.log("Step 6: Token extracted");

      // Step 7: Store token
      setToken(token);
      console.log("Step 7: Token stored");

      // Step 8: Fetch user info
      console.log("Step 8: Fetching user info...");
      const authData = await fetchUserInfo(token);

      if (!authData) {
        throw new Error("Failed to fetch user info");
      }

      console.log("✅ Custom flow completed!");
      return authData;
    } else if (result.type === "cancel") {
      throw new Error("User cancelled login");
    } else if (result.type === "dismiss") {
      throw new Error("Browser dismissed");
    } else {
      throw new Error("Unknown result type");
    }
  } catch (error) {
    console.error("❌ Custom flow error:", error);
    throw error;
  }
};

// ============================================================================
// EXAMPLE 4: With Progress Callback
// ============================================================================

export const googleLoginWithProgress = async (
  onProgress: (step: string, message: string) => void
) => {
  const { setToken } = useAuthStore.getState();

  try {
    onProgress("prepare", "Preparing authentication...");
    prepareGoogleAuth();

    onProgress("redirect", "Generating redirect URL...");
    const redirectUrl = generateRedirectUri();

    onProgress("url", "Building OAuth URL...");
    const authUrl = buildGoogleAuthUrl(redirectUrl);

    onProgress("browser", "Opening browser...");
    const result = await openGoogleAuthSession(authUrl, redirectUrl);

    if (result.type === "success" && result.url) {
      onProgress("token", "Extracting token...");
      const token = extractTokenFromUrl(result.url);

      if (!token) {
        throw new Error("No token received");
      }

      setToken(token);

      onProgress("user", "Fetching user information...");
      const authData = await fetchUserInfo(token);

      if (!authData) {
        throw new Error("Failed to fetch user info");
      }

      onProgress("complete", "Login successful!");
      return authData;
    } else {
      throw new Error(`Authentication ${result.type}`);
    }
  } catch (error) {
    onProgress("error", error instanceof Error ? error.message : "Unknown error");
    throw error;
  }
};

// ============================================================================
// EXAMPLE 5: Testing/Debugging Functions
// ============================================================================

export const testGoogleAuthFunctions = async () => {
  console.log("🧪 Testing Google Auth Service Functions");
  console.log("=".repeat(50));

  // Test 1: Generate redirect URI
  console.log("\n📍 Test 1: Redirect URI Generation");
  const redirectUri = generateRedirectUri();
  console.log("Result:", redirectUri);
  console.log("Should start with:", process.env.NODE_ENV === "production" ? "fe://" : "exp://");

  // Test 2: Build auth URL
  console.log("\n🔗 Test 2: OAuth URL Building");
  const authUrl = buildGoogleAuthUrl(redirectUri);
  console.log("Result:", authUrl);
  console.log("Should contain:", "redirect_uri=" + encodeURIComponent(redirectUri));

  // Test 3: Token extraction
  console.log("\n🎫 Test 3: Token Extraction");
  const testUrl = `${redirectUri}?token=test_jwt_token_123`;
  const extractedToken = extractTokenFromUrl(testUrl);
  console.log("Test URL:", testUrl);
  console.log("Extracted token:", extractedToken);
  console.log("Should be:", "test_jwt_token_123");

  // Test 4: Invalid URL handling
  console.log("\n❌ Test 4: Invalid URL Handling");
  const invalidToken = extractTokenFromUrl("invalid-url");
  console.log("Result:", invalidToken);
  console.log("Should be:", null);

  console.log("\n" + "=".repeat(50));
  console.log("✅ All tests completed");
};

// ============================================================================
// EXAMPLE 6: Error Handling Patterns
// ============================================================================

export const googleLoginWithErrorHandling = async () => {
  const { setToken } = useAuthStore.getState();

  try {
    const result = await loginWithGoogle(setToken);

    if (!result.success) {
      // Handle specific error cases
      switch (result.error) {
        case "Google login was cancelled":
          console.log("ℹ️ User cancelled - this is expected");
          return null; // Don't show error toast

        case "Browser was dismissed":
          console.log("ℹ️ Browser dismissed - user backed out");
          return null;

        case "Another authentication is in progress":
          console.warn("⚠️ Auth already in progress");
          throw new Error("Please wait for current authentication to complete");

        case "No token received from OAuth provider":
          console.error("🔴 Backend integration issue");
          throw new Error("Authentication server error. Please contact support.");

        default:
          console.error("🔴 Unknown error:", result.error);
          throw new Error(result.error || "Authentication failed");
      }
    }

    return result.authData;
  } catch (error) {
    console.error("💥 Unexpected error:", error);

    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred during login");
    }
  }
};

// ============================================================================
// Usage in React Component
// ============================================================================

/*
import { basicGoogleLogin } from '@/examples/googleAuthExample';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const authData = await basicGoogleLogin();
      
      if (authData) {
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: `Welcome ${authData.name}!`,
        });

        // Navigate based on role
        const route = authData.role === 'ADMIN' ? '/manager' : '/home';
        router.replace(route);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onPress={handleGoogleLogin} disabled={isLoading}>
      {isLoading ? <ActivityIndicator /> : <Text>Login with Google</Text>}
    </Button>
  );
}
*/
