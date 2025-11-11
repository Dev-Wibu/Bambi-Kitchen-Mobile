import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/useAuth";
import type { ROLE_TYPE } from "@/interfaces/role.interface";
import { useAuthStore } from "@/stores/authStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Chrome, Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Login() {
  const router = useRouter();
  const { login, loginWithGoogle, logout, isLoading: authLoading } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const validatePhone = (phoneNumber: string) => {
    // Vietnamese phone format: starts with +84 or 0, followed by 3/5/7/8/9 and 8 more digits
    const phoneRegex = /^(\+84|0)[35789]\d{8}$/;
    return phoneRegex.test(phoneNumber);
  };

  const getPostAuthRoute = (role: ROLE_TYPE | undefined) => {
    // Mobile app handling:
    // USER -> home page with tabs
    // ADMIN -> manager interface with tabs
    // STAFF -> blocked (show notification and logout)
    switch (role) {
      case "STAFF":
        return "/manager" as const;
      case "ADMIN":
        return null; // Will show notification for STAFF
      case "USER":
      default:
        return "/home" as const;
    }
  };

  const handleLogin = async () => {
    if (!phone || !password) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter both phone number and password",
      });
      return;
    }

    if (!validatePhone(phone)) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a valid Vietnamese phone number",
      });
      return;
    }

    setIsLoading(true);
    try {
      const authData = await login(phone, password);

      // Check if user role is allowed on mobile
      const targetRoute = getPostAuthRoute(authData?.role);

      if (!targetRoute) {
        // STAFF role cannot access mobile app
        Toast.show({
          type: "error",
          text1: "Access Restricted",
          text2: "Admin features are not available on mobile. Please use the web application.",
          visibilityTime: 5000,
        });
        // Logout the user since they can't use the mobile app
        await logout();
        return;
      }

      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: authData?.role === "STAFF" ? "Welcome to Manager Dashboard!" : "Welcome back!",
      });

      // Navigate to appropriate route based on role
      router.replace(targetRoute);
    } catch (error) {
      console.error("Login error:", error);
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();

      // Get user from auth store after successful login
      const currentUser = useAuthStore.getState().user;
      const targetRoute = getPostAuthRoute(currentUser?.role);

      if (!targetRoute) {
        // STAFF role cannot access mobile app
        Toast.show({
          type: "error",
          text1: "Access Restricted",
          text2: "Staff features are not available on mobile. Please use the web application.",
          visibilityTime: 5000,
        });
        await logout();
        return;
      }

      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: currentUser?.role === "STAFF" ? "Welcome to Manager Dashboard!" : "Welcome back!",
      });

      router.replace(targetRoute);
    } catch (error) {
      console.error("Google login error:", error);
      Toast.show({
        type: "error",
        text1: "Google Login Failed",
        text2: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="min-h-full">
        <View className="flex-1 px-6 py-8">
          {/* Logo/Image Section */}
          <View className="items-center">
            <Image
              source={require("@/assets/images/favicon.png")}
              style={{ width: 200, height: 200 }}
              contentFit="contain"
              accessibilityLabel="App Logo"
            />
          </View>

          {/* Title Section */}
          <View className="mb-8">
            <Text className="mb-2 text-center text-3xl font-bold text-[#000000] dark:text-white">
              Login
            </Text>
            <Text className="text-center text-base text-gray-600 dark:text-gray-300">
              Sign in to experience the best service
            </Text>
          </View>

          {/* Form Section */}
          <View className="mb-6 gap-4">
            {/* Phone Input */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-[#757575]">Phone Number</Text>
              <Input
                placeholder="Enter your phone number (e.g., 0912345678)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-[#757575]">Password</Text>
              <View className="relative">
                <Input
                  placeholder="Enter password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Forgot Password Link */}
            <View className="items-end">
              <Pressable onPress={() => router.push("/forgot-password")}>
                <Text className="text-sm text-[#FF6D00]">Forgot password?</Text>
              </Pressable>
            </View>
          </View>

          {/* Login Button */}
          <View className="mb-4">
            <Button
              className="w-full rounded-3xl bg-[#FF6D00] active:bg-[#FF4D00]"
              onPress={handleLogin}
              disabled={isLoading || authLoading || isGoogleLoading}>
              {isLoading || authLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-lg font-bold text-white">Login</Text>
              )}
            </Button>
          </View>

          {/* Divider */}
          <View className="mb-4 flex-row items-center">
            <View className="flex-1 border-t border-gray-300 dark:border-gray-600" />
            <Text className="mx-4 text-sm text-gray-500 dark:text-gray-400">OR</Text>
            <View className="flex-1 border-t border-gray-300 dark:border-gray-600" />
          </View>

          {/* Google Login Button */}
          <View className="mb-6">
            <Button
              variant="outline"
              className="w-full rounded-3xl border-gray-300"
              style={{ borderWidth: 1, height: 48 }}
              onPress={handleGoogleLogin}
              disabled={isLoading || authLoading || isGoogleLoading}>
              {isGoogleLoading ? (
                <ActivityIndicator color="#FF6D00" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Chrome size={20} color="#4285F4" />
                  <Text className="text-base font-semibold text-gray-700 dark:text-gray-200">
                    Continue with Google
                  </Text>
                </View>
              )}
            </Button>
          </View>

          {/* Register Link */}
          <View className="flex-row items-center justify-center gap-1">
            <Text className="text-sm text-gray-600 dark:text-gray-300">
              Don&apos;t have an account?
            </Text>
            <Pressable onPress={() => router.push("/register")}>
              <Text className="text-sm font-semibold text-[#FF6D00]">Sign up now</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
