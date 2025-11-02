import { NotificationBell } from "@/components/notifications/NotificationBell";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { Text } from "@/components/ui/text";
import { USE_MOCK_DATA, mockDishCategories, mockDishTemplates } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { useDishCategories } from "@/services/dishCategoryService";
import { useDishTemplates } from "@/services/dishService";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function HomeTab() {
  const { user } = useAuth();
  const router = useRouter();

  // Fetch data from API
  const { data: dishTemplatesAPI, isLoading: loadingTemplates } = useDishTemplates();
  const { data: categoriesAPI, isLoading: loadingCategories } = useDishCategories();

  // Use mock data if enabled and API returns empty data
  const dishTemplates =
    USE_MOCK_DATA && (!dishTemplatesAPI || dishTemplatesAPI.length === 0)
      ? mockDishTemplates
      : dishTemplatesAPI || [];
  const categories =
    USE_MOCK_DATA && (!categoriesAPI || categoriesAPI.length === 0)
      ? mockDishCategories
      : categoriesAPI || [];

  const handleTemplatePress = (template: any) => {
    Toast.show({
      type: "info",
      text1: template.name || "Dish Template",
      text2: `Size: ${template.size} - Price Ratio: ${template.priceRatio}`,
    });
  };

  const isLoading = loadingTemplates || loadingCategories;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-8">
        {/* Header with Notification Bell */}
        <View className="mb-6">
          <View className="mb-2 flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-[#757575]">Hello</Text>
              <Text className="text-2xl font-bold text-[#000000] dark:text-white">
                {user?.name || "Welcome"}
              </Text>
            </View>
            <NotificationDropdown>
              <NotificationBell />
            </NotificationDropdown>
          </View>
        </View>

        {/* Search Bar */}
        <Pressable
          onPress={() => router.push("/(tabs)/menu")}
          className="mb-6 flex-row items-center gap-3 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <MaterialIcons name="search" size={24} color="#9CA3AF" />
          <Text className="flex-1 text-base text-gray-500 dark:text-gray-400">
            Search dishes...
          </Text>
          <MaterialIcons name="tune" size={24} color="#000000" className="dark:text-white" />
        </Pressable>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <View className="mb-6">
            <Text className="mb-4 text-lg font-semibold text-[#000000] dark:text-white">
              Categories
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => router.push("/(tabs)/menu")}
                  className="mr-4 items-center">
                  <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-[#FF6D00]/10">
                    <MaterialIcons name="restaurant" size={28} color="#FF6D00" />
                  </View>
                  <Text className="text-xs font-medium text-[#000000] dark:text-white">
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Meal Plans */}
        {dishTemplates && dishTemplates.length > 0 && (
          <View className="mb-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-[#000000] dark:text-white">
                Meal Plans
              </Text>
              <Pressable onPress={() => router.push("/(tabs)/menu")}>
                <Text className="text-sm font-semibold text-[#FF6D00]">View All</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
              {dishTemplates.map((template, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleTemplatePress(template)}
                  className="mr-4 w-56 overflow-hidden rounded-2xl bg-white shadow-md dark:bg-gray-800">
                  <View className="p-5">
                    <View className="mb-3 flex-row items-center justify-between">
                      <View className="rounded-lg bg-[#FF6D00]/10 px-3 py-1">
                        <Text className="font-bold text-[#FF6D00]">{template.size}</Text>
                      </View>
                      <MaterialIcons name="restaurant-menu" size={24} color="#FF6D00" />
                    </View>
                    <Text className="mb-2 text-lg font-bold text-[#000000] dark:text-white">
                      {template.name}
                    </Text>
                    <View className="gap-1">
                      <Text className="text-xs text-gray-600 dark:text-gray-300">
                        Max Protein: {template.max_Protein}g
                      </Text>
                      <Text className="text-xs text-gray-600 dark:text-gray-300">
                        Max Carb: {template.max_Carb}g
                      </Text>
                      <Text className="text-xs text-gray-600 dark:text-gray-300">
                        Max Vegetable: {template.max_Vegetable}g
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View className="flex-1 items-center justify-center py-8">
            <ActivityIndicator size="large" color="#FF6D00" />
            <Text className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Loading content...
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
