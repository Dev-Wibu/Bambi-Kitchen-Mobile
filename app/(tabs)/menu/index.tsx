import { Text } from "@/components/ui/text";
import { USE_MOCK_DATA, mockDishCategories, mockDishTemplates, mockDishes } from "@/data/mockData";
import { useDishCategories } from "@/services/dishCategoryService";
import { useDishTemplates } from "@/services/dishService";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function MenuTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Fetch data from API
  const { data: categoriesAPI, isLoading: loadingCategories } = useDishCategories();
  const { data: dishTemplatesAPI, isLoading: loadingTemplates } = useDishTemplates();

  // Use mock data if enabled and API returns empty data
  const categories =
    USE_MOCK_DATA && (!categoriesAPI || categoriesAPI.length === 0)
      ? mockDishCategories
      : categoriesAPI || [];
  const dishTemplates =
    USE_MOCK_DATA && (!dishTemplatesAPI || dishTemplatesAPI.length === 0)
      ? mockDishTemplates
      : dishTemplatesAPI || [];

  // Use mock dishes when available
  const dishes = USE_MOCK_DATA ? mockDishes : [];

  const handleTemplatePress = (template: any) => {
    Toast.show({
      type: "info",
      text1: template.name || "Dish Template",
      text2: `Size: ${template.size} - Price Ratio: ${template.priceRatio}x`,
    });
  };

  const handleDishPress = (dish: any) => {
    Toast.show({
      type: "info",
      text1: dish.name,
      text2: `$${(dish.price / 100).toFixed(2)} - ${dish.description}`,
    });
  };

  const handleCategoryPress = (categoryId: number) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch =
      searchQuery === "" ||
      dish.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const isLoading = loadingCategories || loadingTemplates;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-8">
        {/* Header */}
        <View className="mb-6">
          <Text className="mb-2 text-3xl font-bold text-[#000000] dark:text-white">Menu</Text>
          <Text className="text-base text-gray-600 dark:text-gray-300">
            Browse our delicious dishes
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

        {/* Categories Filter */}
        {categories && categories.length > 0 && (
          <View className="mb-6">
            <Text className="mb-3 text-base font-semibold text-[#000000] dark:text-white">
              Categories
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Pressable
                onPress={() => setSelectedCategory(null)}
                className={`mr-3 rounded-full px-5 py-2 ${
                  selectedCategory === null
                    ? "bg-[#FF6D00]"
                    : "border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                }`}>
                <Text
                  className={`font-medium ${
                    selectedCategory === null ? "text-white" : "text-[#000000] dark:text-white"
                  }`}>
                  All
                </Text>
              </Pressable>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => handleCategoryPress(category.id!)}
                  className={`mr-3 rounded-full px-5 py-2 ${
                    selectedCategory === category.id
                      ? "bg-[#FF6D00]"
                      : "border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                  }`}>
                  <Text
                    className={`font-medium ${
                      selectedCategory === category.id
                        ? "text-white"
                        : "text-[#000000] dark:text-white"
                    }`}>
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Dish Templates / Menu Items */}
        {dishTemplates && dishTemplates.length > 0 ? (
          <View>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-[#000000] dark:text-white">
                Available Meal Plans
              </Text>
              <Text className="text-sm text-[#757575]">{dishTemplates.length} items</Text>
            </View>
            <View className="gap-4">
              {dishTemplates.map((template, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleTemplatePress(template)}
                  className="overflow-hidden rounded-2xl bg-white shadow-md dark:bg-gray-800">
                  <View className="flex-row">
                    {/* Image Placeholder */}
                    <View className="h-32 w-32 items-center justify-center bg-[#FF6D00]/10">
                      <MaterialIcons name="restaurant-menu" size={48} color="#FF6D00" />
                    </View>
                    {/* Details */}
                    <View className="flex-1 p-4">
                      <Text className="mb-1 text-lg font-bold text-[#000000] dark:text-white">
                        {template.name || `${template.size} Meal Plan`}
                      </Text>
                      <View className="mb-2 flex-row items-center gap-2">
                        <MaterialIcons name="star" size={16} color="#FFA500" />
                        <Text className="text-sm text-[#757575]">Size: {template.size}</Text>
                      </View>
                      <View className="mb-2">
                        <Text className="text-xs text-[#757575]">
                          Max Carb: {template.max_Carb}g | Protein: {template.max_Protein}g
                        </Text>
                        <Text className="text-xs text-[#757575]">
                          Vegetable: {template.max_Vegetable}g
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xl font-bold text-[#FF6D00]">
                          Ratio: {template.priceRatio}x
                        </Text>
                        <Pressable className="rounded-full bg-[#FF6D00] p-2">
                          <MaterialIcons name="add" size={20} color="white" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

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
                      <Image
                        source={{ uri: dish.imageUrl }}
                        className="h-full w-full"
                        contentFit="cover"
                      />
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
                          ${(dish.price! / 100).toFixed(2)}
                        </Text>
                        <Pressable className="rounded-full bg-[#FF6D00] p-2">
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
