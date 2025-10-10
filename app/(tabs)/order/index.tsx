import { Text } from "@/components/ui/text";
import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderTab() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="mb-2 text-3xl font-bold text-[#000000] dark:text-white">Orders</Text>
          <Text className="text-base text-gray-600 dark:text-gray-300">
            View your order history
          </Text>
        </View>

        {/* Empty Orders */}
        <View className="flex-1 items-center justify-center py-12">
          <MaterialIcons name="receipt-long" size={80} color="#E5E7EB" />
          <Text className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-400">
            No orders yet
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-500">
            Your order history will appear here
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
