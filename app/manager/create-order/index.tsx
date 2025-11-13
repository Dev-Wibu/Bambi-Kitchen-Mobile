import { Text } from "@/components/ui/text";

import { $api } from "@/libs/api";

import { formatMoney } from "@/utils/currency";

import { MaterialIcons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import { useState } from "react";

import { ActivityIndicator, Image, Pressable, ScrollView, TextInput, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateOrderMenuScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  // Fetch data from API (no mock)

  const { data: dishTemplatesAPI, isLoading: loadingTemplates } = $api.useQuery(
    "get",

    "/api/dish-template",

    {}
  );

  const { data: dishesAPI, isLoading: loadingDishes } = $api.useQuery("get", "/api/dish", {});

  // Use API dishes only (no mock fallback)

  const dishTemplates = dishTemplatesAPI || [];

  const dishes = dishesAPI || [];

  const handleDishPress = (dish: any) => {
    // 🔄 CHANGED: Navigate to manager create-order routes instead of (tabs)
    if (dish?.id) router.push(`/manager/create-order/${dish.id}`);
  };

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch =
      searchQuery === "" ||
      dish.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const isLoading = loadingTemplates || loadingDishes;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-8">
        {/* Header */}

        <View className="mb-6">
          {/* 🔄 CHANGED: Updated title for staff context */}
          <Text className="mb-2 text-3xl font-bold text-[#000000] dark:text-white">
            Create Order for Customer
          </Text>

          <Text className="text-base text-gray-600 dark:text-gray-300">
            Browse menu and add items to cart
          </Text>
        </View>

        {/* Search Bar */}

        <View className="mb-6 flex-row items-center gap-3 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <MaterialIcons name="search" size={24} color="#9CA3AF" />

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search dishes..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-base text-[#000000] dark:text-white"
          />

          <Pressable>
            <MaterialIcons name="tune" size={24} color="#000000" className="dark:text-white" />
          </Pressable>
        </View>

        {/* Featured: Make Your Own Bowl */}

        <View className="mb-6">
          <Text className="mb-4 text-base font-semibold text-[#000000] dark:text-white">
            Featured
          </Text>

          <Pressable
            // 🔄 CHANGED: Navigate to manager create-order customize screen
            onPress={() => router.push("/manager/create-order/customize")}
            className="overflow-hidden rounded-2xl bg-white shadow-md dark:bg-gray-800">
            <View className="flex-row">
              {/* Bowl Image */}

              <View className="relative h-32 w-32 bg-gray-200 dark:bg-gray-700">
                <Image
                  source={{
                    uri: "https://s3.eu-central-1.amazonaws.com/easyorder-images/prod/products/2674a64b-9741-4c6b-9f31-0d5c35d6ad0e/large/b37492f9d64f851651b03f63e72d81640df380cf028a3d215626e546d429e01a.png",
                  }}
                  style={{ width: 128, height: 128 }}
                  resizeMode="cover"
                />
              </View>

              {/* Details */}

              <View className="flex-1 p-4">
                <Text className="mb-1 text-lg font-bold text-[#000000] dark:text-white">
                  MAKE YOUR OWN BOWL
                </Text>

                <Text className="mb-2 text-sm text-[#757575]" numberOfLines={2}>
                  Build your own poke bowl! (Best consumed within an hour of preparation)
                </Text>

                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-[#FF6D00]">Customize →</Text>
                </View>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Categories Filter */}

        {/* Featured Dishes */}

        {filteredDishes && filteredDishes.length > 0 && (
          <View className="mt-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-[#000000] dark:text-white">
                {searchQuery ? "Search Results" : "All Dishes"}
              </Text>

              <Text className="text-sm text-[#757575]">{filteredDishes.length} dishes</Text>
            </View>

            <View className="gap-4">
              {filteredDishes.map((dish) => (
                <Pressable
                  key={dish.id}
                  onPress={() => handleDishPress(dish)}
                  className="overflow-hidden rounded-2xl bg-white shadow-md dark:bg-gray-800">
                  <View className="flex-row">
                    {/* Dish Image */}

                    <View className="relative h-32 w-32 bg-gray-200 dark:bg-gray-700">
                      {dish?.imageUrl &&
                      typeof dish.imageUrl === "string" &&
                      dish.imageUrl.startsWith("http") ? (
                        <Image
                          source={{ uri: dish.imageUrl }}
                          style={{ width: 128, height: 128 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={{
                            width: 128,

                            height: 128,

                            alignItems: "center",

                            justifyContent: "center",
                          }}>
                          <MaterialIcons name="restaurant-menu" size={36} color="#FF6D00" />
                        </View>
                      )}

                      <View className="absolute right-2 top-2 rounded-full bg-white p-1.5">
                        <MaterialIcons name="favorite-border" size={16} color="#FF6D00" />
                      </View>
                    </View>

                    {/* Dish Details */}

                    <View className="flex-1 p-4">
                      <Text className="mb-1 text-lg font-bold text-[#000000] dark:text-white">
                        {dish.name}
                      </Text>

                      {dish.description && (
                        <Text className="mb-2 text-sm text-[#757575]" numberOfLines={2}>
                          {dish.description}
                        </Text>
                      )}

                      <View className="mb-2 flex-row items-center gap-2">
                        <MaterialIcons name="star" size={16} color="#FFA500" />

                        <Text className="text-sm text-[#757575]">4.8</Text>

                        <Text className="text-sm text-[#757575]">• Popular</Text>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text className="text-xl font-bold text-[#FF6D00]">
                          {formatMoney(dish.price || 0)}
                        </Text>

                        <Pressable
                          onPress={() => handleDishPress(dish)}
                          className="rounded-full bg-[#FF6D00] p-2">
                          <MaterialIcons name="add" size={20} color="white" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Loading State */}

        {isLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#FF6D00" />

            <Text className="mt-4 text-sm text-gray-500">Loading menu...</Text>
          </View>
        ) : !dishTemplates?.length && !filteredDishes.length ? (
          <View className="flex-1 items-center justify-center py-12">
            <MaterialIcons name="restaurant-menu" size={80} color="#E5E7EB" />

            <Text className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-400">
              No items available
            </Text>

            <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-500">
              Check back later for our delicious menu items
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
