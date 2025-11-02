import type { AuthLoginData } from "@/interfaces/auth.interface";
import { fetchClient } from "@/libs/api";
import { extractRole } from "@/services/accountService";
import { useAuthStore } from "@/stores/authStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

/**
 * OAuth2 callback handler for Google login
 * This screen is redirected to from the backend after successful Google authentication
 * URL format: /oauth2/callback?token={jwt}
 */
export default function OAuth2Callback() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const { setUser, setToken, setIsLoggedIn } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = params.token;

        if (!token) {
          throw new Error("No authentication token received");
        }

        // Store the JWT token
        setToken(token);

        // Fetch user info with the token
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

          // Save auth state
          setUser(authData);
          setIsLoggedIn(true);

          Toast.show({
            type: "success",
            text1: "Login Successful",
            text2: `Welcome ${name}!`,
          });

          // Navigate based on role
          const targetRoute = authData.role === "ADMIN" ? "/manager" : "/(tabs)/home";
          router.replace(targetRoute);
        } else {
          throw new Error("Failed to fetch user information");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        Toast.show({
          type: "error",
          text1: "Authentication Failed",
          text2: error instanceof Error ? error.message : "Please try again",
        });
        // Redirect to login on error
        router.replace("/(auth)/login");
      } finally {
        setIsProcessing(false);
      }
    };

    handleOAuthCallback();
  }, [params.token, router, setToken, setUser, setIsLoggedIn]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator size="large" color="#FF6D00" />
        <Text className="mt-4 text-center text-lg text-gray-600 dark:text-gray-300">
          Completing sign in...
        </Text>
      </View>
    </SafeAreaView>
  );
}
