import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/stores/authStore";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DebugToken() {
  const { token, user, isLoggedIn } = useAuthStore();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 p-6">
        {/* Header */}
        <View className="mb-6 flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-4">
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text className="text-2xl font-bold">Debug Token</Text>
        </View>

        <ScrollView className="flex-1">
          {/* Login Status */}
          <View className="mb-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <Text className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              Login Status
            </Text>
            <Text className="text-base text-gray-700 dark:text-gray-300">
              {isLoggedIn ? "✅ Logged In" : "❌ Not Logged In"}
            </Text>
          </View>

          {/* User Info */}
          <View className="mb-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <Text className="mb-2 text-lg font-bold text-gray-900 dark:text-white">User Info</Text>
            <Text className="text-sm text-gray-700 dark:text-gray-300">
              {user ? JSON.stringify(user, null, 2) : "No user data"}
            </Text>
          </View>

          {/* Token */}
          <View className="mb-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <Text className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Token</Text>
            {token ? (
              <>
                <Text className="mb-2 text-xs text-gray-700 dark:text-gray-300">
                  First 50 chars:
                </Text>
                <Text className="mb-4 font-mono text-sm text-gray-900 dark:text-white">
                  {token.substring(0, 50)}...
                </Text>
                <Text className="mb-2 text-xs text-gray-700 dark:text-gray-300">Full token:</Text>
                <Text className="font-mono text-xs text-gray-900 dark:text-white" selectable={true}>
                  {token}
                </Text>
              </>
            ) : (
              <Text className="text-base text-red-500">❌ No token found</Text>
            )}
          </View>

          {/* Instructions */}
          <View className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900">
            <Text className="mb-2 text-lg font-bold text-blue-900 dark:text-blue-100">
              📋 Instructions
            </Text>
            <Text className="text-sm text-blue-800 dark:text-blue-200">
              1. If no token, go to Login screen {"\n"}
              2. Login with your credentials {"\n"}
              3. Come back here to see the token {"\n"}
              4. Token should be stored in AsyncStorage
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
