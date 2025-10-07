import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/useAuth";
import type { ROLE_TYPE } from "@/interfaces/role.interface";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // MOCKAPI: This form uses mock API for registration
  // All new accounts are saved to mock storage (accountMockApi.ts)

  const validatePhone = (phoneNumber: string) => {
    // Vietnamese phone format: starts with +84 or 0, followed by 3/5/7/8/9 and 8 more digits
    const phoneRegex = /^(\+84|0)[35789]\d{8}$/;
    return phoneRegex.test(phoneNumber);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPostAuthRoute = (role: ROLE_TYPE | undefined) => {
    switch (role) {
      case "ADMIN":
      case "STAFF":
        return "/manager" as const;
      case "USER":
      default:
        return "/home" as const;
    }
  };

  const handleRegister = async () => {
    // Basic validation
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill in all required fields",
      });
      return;
    }

    if (!validateEmail(email)) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a valid email address",
      });
      return;
    }

    if (!validatePhone(phone)) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a valid Vietnamese phone number (e.g., 0912345678)",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Passwords do not match",
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Password must be at least 6 characters",
      });
      return;
    }

    setIsLoading(true);
    try {
      const authData = await register(fullName, email, password, phone);

      Toast.show({
        type: "success",
        text1: "Registration Successful",
        text2: "Welcome! You are now logged in.",
      });

      // Navigate to main app after successful registration and auto-login
      const targetRoute = getPostAuthRoute(authData?.role);
      router.replace(targetRoute);
    } catch (error) {
      console.error("Registration error:", error);
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="min-h-full">
        <View className="flex-1 px-6 py-8">
          {/* Logo/Image Section */}
          <View className="mb-6 items-center">
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: 90, height: 90 }}
              contentFit="contain"
              accessibilityLabel="App Logo"
            />
          </View>

          {/* Title Section */}
          <View className="mb-6">
            <Text className="mb-2 text-center text-3xl font-bold text-[#000000] dark:text-white">
              Register
            </Text>
            <Text className="text-center text-base text-gray-600 dark:text-gray-300">
              Create a new account to experience the best service
            </Text>
          </View>

          {/* Form Section */}
          <View className="mb-6 gap-4">
            {/* Full Name Input */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-[#757575]">Full Name</Text>
              <Input
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            {/* Email Input */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-[#757575]">Email</Text>
              <Input
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Phone Input */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-[#757575]">
                Phone Number <Text className="text-red-500">*</Text>
              </Text>
              <Input
                placeholder="Enter your phone number (e.g., 0912345678)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
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

            {/* Confirm Password Input */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-[#757575]">Confirm Password</Text>
              <View className="relative">
                <Input
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </Pressable>
              </View>
            </View>
          </View>

          {/* Register Button */}
          <View className="mb-6">
            <Button
              className="w-full bg-[#FF6D00] active:bg-[#FF4D00]"
              onPress={handleRegister}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-lg font-bold text-white">Register</Text>
              )}
            </Button>
          </View>

          {/* Login Link */}
          <View className="mb-6 flex-row items-center justify-center gap-1">
            <Text className="text-sm text-gray-600 dark:text-gray-300">
              Already have an account?
            </Text>
            <Pressable onPress={() => router.push("/login")}>
              <Text className="text-sm font-semibold text-[#FF6D00]">Login now</Text>
            </Pressable>
          </View>

          {/* Decorative Image */}
          <View className="items-center">
            <Image
              source={require("@/assets/images/react-logo.png")}
              style={{ width: 120, height: 120, opacity: 0.3 }}
              contentFit="contain"
              accessibilityLabel="Decorative Image"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
