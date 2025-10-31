import { Text } from "@/components/ui/text";

import { USE_MOCK_DATA, mockDiscounts, mockDishTemplates, mockDishes } from "@/data/mockData";

import { useAuth } from "@/hooks/useAuth";

import { useDiscounts } from "@/services/discountService";

import { useDishTemplates, useDishes } from "@/services/dishService";

import { useCartStore } from "@/stores/cartStore";

import { MaterialIcons } from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";

import { Image } from "expo-image";

import { useRouter } from "expo-router";

import { useState } from "react";

import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Toast from "react-native-toast-message";

export default function HomeTab() {
  const { user } = useAuth();

  const router = useRouter();

  const { getTotalItems } = useCartStore();

  const cartItemCount = getTotalItems();

  // Fetch data from API

  const { data: dishTemplatesAPI, isLoading: loadingTemplates } = useDishTemplates();

  const { data: dishesAPI, isLoading: loadingDishes } = useDishes();

  const { data: discountsAPI, isLoading: loadingDiscounts } = useDiscounts();

  // Use API data first, fallback to mock only if USE_MOCK_DATA is true AND API is empty

  const dishTemplates =
    dishTemplatesAPI && dishTemplatesAPI.length > 0
      ? dishTemplatesAPI
      : USE_MOCK_DATA
        ? mockDishTemplates
        : [];

  const dishes = dishesAPI && dishesAPI.length > 0 ? dishesAPI : USE_MOCK_DATA ? mockDishes : [];

  // Always use mock data for discounts since backend API is not available yet

  const discounts = mockDiscounts;

  const handleTemplatePress = (template: any) => {
    Toast.show({
      type: "info",

      text1: template.name || "Dish Template",

      text2: `Size: ${template.size} - Price Ratio: ${template.priceRatio}`,
    });
  };

  const handleDishPress = (dish: any) => {
    Toast.show({
      type: "info",

      text1: dish.name || "Dish",

      text2: `$${((dish.price || 0) / 1000).toFixed(2)}`,
    });
  };

  const isLoading = loadingTemplates || loadingDishes || loadingDiscounts;

  // Track image load errors per discount id to fallback gracefully

  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  // Search state

  const [searchQuery, setSearchQuery] = useState("");

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter dishes based on search query

  const filteredDishes = searchQuery.trim()
    ? dishes.filter(
        (dish) =>
          (dish.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (dish.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-8">
        {/* Header with Cart Badge */}

        <View className="mb-6">
          <View className="mb-2 flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-[#757575]">Welcome,</Text>

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
              {discounts.slice(0, 3).map((discount) => {
                const showImage = !!discount.imageUrl && !imageError[discount.id as number];

                return (
                  <View
                    key={discount.id}
                    className="mr-4 w-72 overflow-hidden rounded-xl shadow-lg">
                    {showImage ? (
                      <View className="relative h-40">
                        <Image
                          source={{ uri: discount.imageUrl as string }}
                          style={{ width: "100%", height: 160 }}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          onError={(error) => {
                            setImageError((prev) => ({ ...prev, [discount.id as number]: true }));
                          }}
                        />

                        <View className="absolute inset-0 justify-end p-2">
                          <View className="gap-1">
                            <Text className="text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                              SPECIAL OFFER
                            </Text>

                            <Text
                              className="text-3xl font-black text-white shadow-2xl"
                              style={{
                                textShadowColor: "rgba(0, 0, 0, 0.75)",

                                textShadowOffset: { width: 0, height: 2 },

                                textShadowRadius: 4,
                              }}>
                              {discount.discountPercent}% OFF
                            </Text>

                            <Text
                              className="text-lg font-bold text-white shadow-lg"
                              style={{
                                textShadowColor: "rgba(0, 0, 0, 0.5)",

                                textShadowOffset: { width: 0, height: 1 },

                                textShadowRadius: 3,
                              }}>
                              {discount.name}
                            </Text>

                            {discount.description && (
                              <Text
                                className="mt-1 text-sm text-white/95 shadow-md"
                                style={{
                                  textShadowColor: "rgba(0, 0, 0, 0.5)",

                                  textShadowOffset: { width: 0, height: 1 },

                                  textShadowRadius: 2,
                                }}>
                                {discount.description}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    ) : (
                      <LinearGradient
                        colors={["#f8ecdf", "#FF6D00"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="h-40 p-2">
                        <Text className="text-xs font-medium text-white/80">SPECIAL OFFER</Text>

                        <Text className="mt-1 text-2xl font-bold text-white">
                          {discount.discountPercent}% OFF
                        </Text>

                        <Text className="mt-1 text-base font-semibold text-white">
                          {discount.name}
                        </Text>

                        {discount.description && (
                          <Text className="mt-1 text-xs text-white/90">{discount.description}</Text>
                        )}
                      </LinearGradient>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Search Bar */}

        <View className="mb-6 flex-row items-center gap-3 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <MaterialIcons name="search" size={24} color="#9CA3AF" />

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search dishes..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-base text-gray-900 dark:text-white"
          />

          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <MaterialIcons name="close" size={24} color="#9CA3AF" />
            </Pressable>
          ) : (
            <MaterialIcons name="tune" size={24} color="#000000" className="dark:text-white" />
          )}
        </View>

        {/* Search Results */}

        {searchQuery.trim().length > 0 && (
          <View className="mb-6">
            <Text className="mb-4 text-lg font-semibold text-[#000000] dark:text-white">
              Search Results ({filteredDishes.length})
            </Text>

            {filteredDishes.length > 0 ? (
              <View className="gap-4">
                {filteredDishes.map((dish) => (
                  <Pressable
                    key={dish.id}
                    onPress={() => {
                      Toast.show({
                        type: "info",

                        text1: dish.name || "Dish",

                        text2: `$${((dish.price || 0) / 100).toFixed(2)}`,
                      });
                    }}
                    className="flex-row overflow-hidden rounded-2xl bg-white shadow-md dark:bg-gray-800">
                    {/* Dish Image */}

                    <View className="h-24 w-24 bg-gray-200 dark:bg-gray-700">
                      <Image
                        source={{ uri: dish.imageUrl || dish.file }}
                        className="h-full w-full"
                        contentFit="cover"
                      />
                    </View>

                    {/* Dish Info */}

                    <View className="flex-1 p-3">
                      <Text className="mb-1 text-base font-bold text-[#000000] dark:text-white">
                        {dish.name || "Unnamed Dish"}
                      </Text>

                      {dish.description && (
                        <Text className="mb-2 text-xs text-[#757575]" numberOfLines={2}>
                          {dish.description}
                        </Text>
                      )}

                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-bold text-[#FF6D00]">
                          ${((dish.price || 0) / 1000).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View className="items-center py-8">
                <MaterialIcons name="search-off" size={48} color="#9CA3AF" />

                <Text className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  No dishes found for "{searchQuery}"
                </Text>
              </View>
            )}
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

        {dishes && dishes.length > 0 && (
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
              {dishes.slice(0, 6).map((dish) => (
                <Pressable
                  key={dish.id}
                  onPress={() => handleDishPress(dish)}
                  className="mr-4 w-44 overflow-hidden rounded-2xl bg-white shadow-md dark:bg-gray-800">
                  {/* Dish Image */}

                  <View className="relative h-32 w-full bg-gray-200 dark:bg-gray-700">
                    {dish.imageUrl ? (
                      <Image
                        source={{ uri: dish.imageUrl || dish.file }}
                        className="h-full w-full"
                        contentFit="cover"
                      />
                    ) : (
                      <View className="h-full w-full items-center justify-center">
                        <MaterialIcons name="restaurant" size={48} color="#9CA3AF" />
                      </View>
                    )}

                    <View className="absolute right-2 top-2 rounded-full bg-white p-1.5">
                      <MaterialIcons name="favorite-border" size={18} color="#FF6D00" />
                    </View>
                  </View>

                  {/* Dish Info */}

                  <View className="p-3">
                    <Text
                      className="mb-1 text-sm font-bold text-[#000000] dark:text-white"
                      numberOfLines={1}>
                      {dish.name || "Unnamed Dish"}
                    </Text>

                    {dish.description && (
                      <Text className="mb-2 text-xs text-[#757575]" numberOfLines={2}>
                        {dish.description}
                      </Text>
                    )}

                    <View className="flex-row items-center justify-between">
                      <Text className="text-base font-bold text-[#FF6D00]">
                        ${((dish.price || 0) / 1000).toFixed(2)}
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

