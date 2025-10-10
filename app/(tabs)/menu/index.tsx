import { Text } from "@/components/ui/text";
import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MenuTab() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="mb-2 text-3xl font-bold text-[#000000] dark:text-white">Menu</Text>
          <Text className="text-base text-gray-600 dark:text-gray-300">Browse our menu</Text>
        </View>

        {/* Placeholder Content */}
        <View className="flex-1 items-center justify-center py-12">
          <MaterialIcons name="restaurant-menu" size={80} color="#E5E7EB" />
          <Text className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-400">
            Menu coming soon
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-500">
            Our delicious menu items will be available here
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
