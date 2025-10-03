import { Text } from "@/components/ui/text";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export default function NotFound() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 items-center justify-center px-6">
        {/* Error Icon */}
        <View className="mb-8 items-center justify-center rounded-full bg-red-100 p-6 dark:bg-red-900/30">
          <Feather name="alert-triangle" size={48} color="#EF4444" />
        </View>

        {/* Error Message */}
        <Text className="mb-2 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Page Not Found
        </Text>
        <Text className="mb-8 text-center text-lg text-gray-600 dark:text-gray-300">
          Oops! The page you are looking for does not exist or has been moved.
        </Text>

        {/* Back to Home Button */}
        <Pressable
          className="w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#8BC34A] to-[#4CAF50] py-4 shadow-sm"
          onPress={() => router.replace({ pathname: "/" })}>
          <Text className="text-center text-lg font-bold text-white">Back to Home</Text>
        </Pressable>

        {/* Report Button */}
        <Pressable
          className="mt-4"
          onPress={() => {
            // You could implement a feedback or report system here
            console.log("Report issue");
          }}>
          <Text className="text-[#4CAF50]">Report this issue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
