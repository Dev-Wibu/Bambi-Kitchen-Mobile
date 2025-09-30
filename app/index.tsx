import { ThemeToggle } from "@/components/ThemeToggle";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "expo-router";
import { Pressable, SafeAreaView, View } from "react-native";
import "../global.css";

export default function Index() {
  const { isAuthenticated, account, logout } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 items-center justify-center px-6">
        {/* Theme Toggle */}
        <View className="absolute right-6 top-12">
          <ThemeToggle />
        </View>

        {/* Welcome Content */}
        <View className="mb-12 items-center">
          <Text className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            {isAuthenticated ? `Welcome back, ${account?.name}!` : "Welcome to Our App!"}
          </Text>
          <Text className="mb-8 text-center text-lg text-gray-600 dark:text-gray-300">
            {isAuthenticated
              ? "You are successfully logged in to your account"
              : "Get started by logging in or creating a new account"}
          </Text>
        </View>

        {/* Navigation Buttons */}
        <View className="w-full max-w-sm space-y-4">
          {isAuthenticated ? (
            <Pressable
              onPress={logout}
              className="w-full rounded-3xl bg-gradient-to-r from-red-500 to-red-600 py-4 shadow-sm">
              <Text className="text-center text-lg font-bold text-white">Logout</Text>
            </Pressable>
          ) : (
            <>
              <Link href="/auth/login" asChild>
                <Pressable className="w-full rounded-3xl bg-gradient-to-r from-[#8BC34A] to-[#4CAF50] py-4 shadow-sm">
                  <Text className="text-center text-lg font-bold text-white">Login to Account</Text>
                </Pressable>
              </Link>

              <Link href="/auth/signup" asChild>
                <Pressable className="w-full rounded-3xl border-2 border-[#4CAF50] bg-white py-4 shadow-sm">
                  <Text className="text-center text-lg font-bold text-[#4CAF50]">
                    Create Account
                  </Text>
                </Pressable>
              </Link>
            </>
          )}
        </View>

        {/* Additional Content */}
        <View className="mt-12">
          <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
            {isAuthenticated
              ? `Role: ${account?.role} | Status: ${account?.active ? "Active" : "Inactive"}`
              : "Join thousands of users who trust our platform"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
