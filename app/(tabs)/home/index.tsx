import { Text } from "@/components/ui/text";
import {
  USE_MOCK_DATA,
  mockDiscounts,
  mockDishCategories,
  mockDishTemplates,
  mockDishes,
} from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { useDiscounts } from "@/services/discountService";
import { useDishCategories } from "@/services/dishCategoryService";
import { useDishTemplates } from "@/services/dishService";
import { useCartStore } from "@/stores/cartStore";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function HomeTab() {
  const { user } = useAuth();
  const router = useRouter();
  const { getTotalItems } = useCartStore();
  const cartItemCount = getTotalItems();

  // Fetch data from API
  const { data: dishTemplatesAPI, isLoading: loadingTemplates } = useDishTemplates();
  const { data: categoriesAPI, isLoading: loadingCategories } = useDishCategories();
  const { data: discountsAPI, isLoading: loadingDiscounts } = useDiscounts();

  // Use mock data if enabled and API returns empty data
  const dishTemplates =
    USE_MOCK_DATA && (!dishTemplatesAPI || dishTemplatesAPI.length === 0)
      ? mockDishTemplates
      : dishTemplatesAPI || [];
  const categories =
    USE_MOCK_DATA && (!categoriesAPI || categoriesAPI.length === 0)
      ? mockDishCategories
      : categoriesAPI || [];
  const discounts =
    USE_MOCK_DATA && (!discountsAPI || discountsAPI.length === 0)
      ? mockDiscounts
      : discountsAPI || [];

  const handleTemplatePress = (template: any) => {
    Toast.show({
      type: "info",
      text1: template.name || "Dish Template",
      text2: `Size: ${template.size} - Price Ratio: ${template.priceRatio}`,
    });
  };

  const isLoading = loadingTemplates || loadingCategories || loadingDiscounts;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-8">
        {/* Header with Cart Badge */}
        <View className="mb-6">
          <View className="mb-2 flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-[#757575]">Deliver to</Text>
              <Text className="text-2xl font-bold text-[#000000] dark:text-white">
                {user?.name || "Welcome"}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/(tabs)/cart")}
              className="relative rounded-full bg-white p-3 shadow-sm dark:bg-gray-800">
              <MaterialIcons name="shopping-cart" size={24} color="#FF6D00" />
              {cartItemCount > 0 && (
                <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500">
                  <Text className="text-xs font-bold text-white">{cartItemCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Discounts/Promotions Banner */}
        {discounts && discounts.length > 0 && (
          <View className="mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
              {discounts.slice(0, 3).map((discount) => (
                <View
                  key={discount.id}
                  className="mr-4 w-72 overflow-hidden rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#FF6D00] p-6 shadow-lg">
                  <Text className="text-xs font-medium text-white/80">SPECIAL OFFER</Text>
                  <Text className="mt-2 text-2xl font-bold text-white">
                    {discount.discountPercent}% OFF
                  </Text>
                  <Text className="mt-1 text-base font-semibold text-white">{discount.name}</Text>
                  {discount.description && (
                    <Text className="mt-2 text-xs text-white/90">{discount.description}</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

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

        {/* Meal Plans / Templates */}
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
                  className="mr-4 w-32 overflow-hidden rounded-2xl bg-white shadow-md dark:bg-gray-800">
                  <View className="h-28 items-center justify-center bg-[#FF6D00]/10">
                    <MaterialIcons name="restaurant-menu" size={48} color="#FF6D00" />
                  </View>
                  <View className="p-3">
                    <Text className="mb-1 text-sm font-bold text-[#000000] dark:text-white">
                      {template.name || `Size ${template.size}`}
                    </Text>
                    <Text className="text-xs text-[#757575]">
                      {template.size} - Ratio: {template.priceRatio}x
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured Dishes */}
        {USE_MOCK_DATA && mockDishes && mockDishes.length > 0 && (
          <View className="mb-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-[#000000] dark:text-white">
                Featured Dishes
              </Text>
              <Pressable onPress={() => router.push("/(tabs)/menu")}>
                <Text className="text-sm font-semibold text-[#FF6D00]">View All</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
              {mockDishes.slice(0, 4).map((dish) => (
                <Pressable
                  key={dish.id}
                  onPress={() => {
                    Toast.show({
                      type: "info",
                      text1: dish.name,
                      text2: `$${(dish.price! / 100).toFixed(2)}`,
                    });
                  }}
                  className="mr-4 w-44 overflow-hidden rounded-2xl bg-white shadow-md dark:bg-gray-800">
                  {/* Dish Image */}
                  <View className="relative h-32 w-full bg-gray-200 dark:bg-gray-700">
                    <Image
                      source={{ uri: dish.imageUrl }}
                      className="h-full w-full"
                      contentFit="cover"
                    />
                    <View className="absolute right-2 top-2 rounded-full bg-white p-1.5">
                      <MaterialIcons name="favorite-border" size={18} color="#FF6D00" />
                    </View>
                  </View>
                  {/* Dish Info */}
                  <View className="p-3">
                    <Text
                      className="mb-1 text-sm font-bold text-[#000000] dark:text-white"
                      numberOfLines={1}>
                      {dish.name}
                    </Text>
                    {dish.description && (
                      <Text className="mb-2 text-xs text-[#757575]" numberOfLines={2}>
                        {dish.description}
                      </Text>
                    )}
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base font-bold text-[#FF6D00]">
                        ${(dish.price! / 100).toFixed(2)}
                      </Text>
                      <Pressable className="rounded-full bg-[#FF6D00] p-1.5">
                        <MaterialIcons name="add" size={16} color="white" />
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="mb-4 text-lg font-semibold text-[#000000] dark:text-white">
            Quick Actions
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={() => router.push("/(tabs)/menu")}
              className="flex-row items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#FF6D00]/10">
                  <MaterialIcons name="restaurant" size={24} color="#FF6D00" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-[#000000] dark:text-white">
                    Browse Menu
                  </Text>
                  <Text className="text-sm text-[#757575]">Explore our delicious dishes</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
            </Pressable>

            <Pressable
              onPress={() => router.push("/(tabs)/order")}
              className="flex-row items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#FF6D00]/10">
                  <MaterialIcons name="receipt-long" size={24} color="#FF6D00" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-[#000000] dark:text-white">
                    My Orders
                  </Text>
                  <Text className="text-sm text-[#757575]">View order history</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color="#FF6D00" />
            <Text className="mt-4 text-sm text-gray-500">Loading...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
