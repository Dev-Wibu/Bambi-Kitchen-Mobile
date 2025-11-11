import { NotificationBell } from "@/components/notifications/NotificationBell";

import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

import { Text } from "@/components/ui/text";

import { USE_MOCK_DATA, mockDishTemplates } from "@/data/mockData";

import { useAuth } from "@/hooks/useAuth";

import { useIngredientCategories } from "@/services/ingredientCategoryService";

import { useDishTemplates, useDishes } from "@/services/dishService";

import { formatMoney } from "@/utils/currency";

import { ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

import Toast from "react-native-toast-message";

export default function HomeTab() {
  const { user } = useAuth();

  const router = useRouter();

  // Helpers: normalize text (remove Vietnamese diacritics) then map to an icon name

  const normalize = (s?: string) =>
    (s || "")

      .normalize("NFD")

      .replace(/[\u0300-\u036f]/g, "")

      .toLowerCase();

  // Map ingredient category name (VN + EN keywords) to a decorative MaterialIcons icon

  const mapIngredientIcon = (name?: string): string => {
    const n = normalize(name);

    if (!n) return "restaurant";

    if (/(thit|bo|heo|ga|protein|meat|beef|pork|chicken)/.test(n)) return "set-meal";

    if (/(rau|rau tươi|salad|la|herb|vegetable|veg|greens)/.test(n)) return "eco";

    if (/(hai san|ca|tom|muc|seafood|fish|shrimp|prawn)/.test(n)) return "lunch-dining";

    if (/(sot|nuoc mam|tuong|condiment|sauce)/.test(n)) return "emoji-food-beverage";

    if (/(tinh bot|gao|com|bun|mi|banh|grain|rice|noodle|bread|carb)/.test(n))
      return "ramen-dining";

    if (/(trai cay|hoa qua|fruit)/.test(n)) return "spa";

    if (/(hat|dau|nuts?|beans?)/.test(n)) return "emoji-nature";

    if (/(nam|mushroom)/.test(n)) return "yard";

    if (/(nuoc|water|drink)/.test(n)) return "water-drop";

    return "restaurant";
  };

  // Navigate to dish detail

  const handleDishPress = (dish: any) => {
    if (!dish || !dish.id) return;

    router.push(`/(tabs)/menu/${dish.id}`);
  };

  // Fetch data from API

  const { data: dishTemplatesAPI, isLoading: loadingTemplates } = useDishTemplates();

  const { data: dishesAPI, isLoading: loadingDishes } = useDishes();

  const { data: ingredientCategories, isLoading: loadingIngredientCategories } =
    useIngredientCategories();

  // Use mock data if enabled and API returns empty data

  const dishTemplates =
    USE_MOCK_DATA && (!dishTemplatesAPI || dishTemplatesAPI.length === 0)
      ? mockDishTemplates
      : dishTemplatesAPI || [];

  const categories = ingredientCategories || [];

  const dishes = dishesAPI || [];

  // Show only public, active dishes on Home

  const displayedDishes = dishes.filter((d: any) => d && d.public && d.active);

  // Debug: log the first few dishes so we can confirm imageUrl values on device

  try {
    console.log(
      "Home displayedDishes",

      displayedDishes

        .slice(0, 6)

        .map((d: any) => ({ id: d.id, imageUrl: d.imageUrl, file: d.file }))
    );
  } catch (e) {
    // ignore logging errors in environments without console
  }

  const handleTemplatePress = (template: any) => {
    Toast.show({
      type: "info",

      text1: template.name || "Dish Template",

      text2: `Size: ${template.size} - Price Ratio: ${template.priceRatio}`,
    });
  };

  const isLoading = loadingTemplates || loadingIngredientCategories || loadingDishes;

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

        {/* Ingredient Categories */}

        {categories && categories.length > 0 && (
          <View className="mb-6">
            <Text className="mb-4 text-lg font-semibold text-[#000000] dark:text-white">
              Ingredient Categories
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <View key={category.id} className="mr-4 items-center">
                  <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-[#FF6D00]/10">
                    <MaterialIcons
                      name={mapIngredientIcon(category?.name) as any}
                      size={28}
                      color="#FF6D00"
                    />
                  </View>

                  <Text className="text-xs font-medium text-[#000000] dark:text-white">
                    {category.name}
                  </Text>
                </View>
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

        {/* Featured: Make Your Own Bowl */}

        <View className="mb-6">
          <Text className="mb-4 text-lg font-semibold text-[#000000] dark:text-white">
            Featured
          </Text>

          <Pressable
            onPress={() => router.push("/(tabs)/menu/customize")}
            className="w-44 rounded-xl bg-white p-2 shadow-sm dark:bg-gray-800">
            <View className="h-28 w-full overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-700">
              <Image
                source={{
                  uri: "https://s3.eu-central-1.amazonaws.com/easyorder-images/prod/products/2674a64b-9741-4c6b-9f31-0d5c35d6ad0e/large/b37492f9d64f851651b03f63e72d81640df380cf028a3d215626e546d429e01a.png",
                }}
                style={{ width: "100%", height: 112 }}
                resizeMode="cover"
              />
            </View>

            <View className="mt-2">
              <Text className="text-sm font-semibold text-[#000000] dark:text-white">
                MAKE YOUR OWN BOWL
              </Text>

              <Text className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Build your own poke bowl!
              </Text>

              <Text className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                (Best consumed within an hour)
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Dishes (show a few) */}

        {dishes && dishes.length > 0 && (
          <View className="mt-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-[#000000] dark:text-white">Dishes</Text>

              <Pressable onPress={() => router.push("/(tabs)/menu")}>
                <Text className="text-sm text-[#FF6D00]">View all</Text>
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {displayedDishes.slice(0, 6).map((dish: any) => (
                <Pressable
                  key={dish.id}
                  onPress={() => handleDishPress(dish)}
                  className="mr-4 w-44 rounded-xl bg-white p-2 shadow-sm dark:bg-gray-800">
                  <View className="h-28 w-full overflow-hidden rounded-lg">
                    {dish?.imageUrl &&
                    typeof dish.imageUrl === "string" &&
                    dish.imageUrl.startsWith("http") ? (
                      <Image
                        source={{ uri: dish.imageUrl }}
                        style={{ width: "100%", height: 112 }}
                        resizeMode="cover"
                      />
                    ) : dish?.file &&
                      typeof dish.file === "string" &&
                      dish.file.startsWith("http") ? (
                      <Image
                        source={{ uri: dish.file }}
                        style={{ width: "100%", height: 112 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={{
                          width: "100%",

                          height: "100%",

                          alignItems: "center",

                          justifyContent: "center",

                          backgroundColor: "#f3f4f6",
                        }}>
                        <MaterialIcons name="restaurant-menu" size={40} color="#FF6D00" />
                      </View>
                    )}
                  </View>

                  <View className="mt-2">
                    <Text className="text-sm font-medium text-[#000000] dark:text-white">
                      {dish.name}
                    </Text>

                    <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {formatMoney(dish.price || 0)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

