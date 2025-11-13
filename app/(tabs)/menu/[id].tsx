import { Text } from "@/components/ui/text";
import { $api } from "@/libs/api";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/utils/currency";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function DishDetail() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const idParam = params.id;
  const router = useRouter();
  // Robustly parse id from route params (string or string[]), ignore invalid values
  const parsedId = useMemo(() => {
    const v = Array.isArray(idParam) ? idParam[0] : idParam;
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [idParam]);
  // Load single dish by id (no mock)
  const { data: dish, isLoading } = $api.useQuery("get", "/api/dish/{id}", {
    params: { path: { id: (parsedId as number) ?? 0 } },
    enabled: !!parsedId,
  });
  // Try to fetch recipe details for this dish (some backends return recipe with full ingredient objects)
  const { data: recipeRaw } = $api.useQuery("get", "/api/recipe/by-dish/{id}", {
    params: { path: { id: (parsedId as number) ?? 0 } },
    enabled: !!parsedId,
  });
  // Fallback: fetch all dishes and find by id if direct endpoint fails/unavailable
  const { data: dishesFallback } = $api.useQuery("get", "/api/dish", {
    enabled: !!parsedId,
  });
  const dishData: any = dish || (dishesFallback || []).find((d: any) => d?.id === parsedId);
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);

  // Normalize recipeRaw into ingredients array
  const safeExtractIngredients = (raw: any): any[] => {
    try {
      if (!raw) return [];
      if (Array.isArray(raw)) {
        const first = raw.find((r) => Array.isArray(r?.ingredients)) || raw[0];
        if (!first) return [];
        return first.ingredients || first.items || first.content || first.result || [];
      }
      return raw.ingredients || raw.items || raw.content || raw.result || [];
    } catch {
      return [];
    }
  };

  // Helper to handle different possible image fields from backend
  const getImageUrl = (obj: any) => {
    return (
      obj?.imageUrl ||
      obj?.image ||
      obj?.thumbnailUrl ||
      obj?.image_url ||
      obj?.photo ||
      obj?.avatarUrl ||
      null
    );
  };

  const recipeIngredients = useMemo(() => safeExtractIngredients(recipeRaw), [recipeRaw]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#FF6D00" />
      </SafeAreaView>
    );
  }

  if (!parsedId) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Text className="text-lg">Invalid dish id</Text>
        <Pressable
          onPress={() => router.push("/(tabs)/menu")}
          className="mt-4 rounded-xl bg-[#FF6D00] px-4 py-2">
          <Text className="text-white">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!dishData) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Text className="text-lg">Dish not found</Text>
        <Pressable
          onPress={() => router.push("/(tabs)/menu")}
          className="mt-4 rounded-xl bg-[#FF6D00] px-4 py-2">
          <Text className="text-white">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <Pressable onPress={() => router.push("/(tabs)/menu")} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-[#000000] dark:text-white">Dish detail</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Large Image */}
        <View className="items-center bg-white py-6 dark:bg-gray-900">
          {dishData?.imageUrl &&
          typeof dishData.imageUrl === "string" &&
          dishData.imageUrl.startsWith("http") ? (
            <Image
              source={{ uri: dishData.imageUrl }}
              style={{ width: 360, height: 260, borderRadius: 16 }}
              resizeMode="cover"
            />
          ) : (
            <View className="h-64 w-[360px] items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <MaterialIcons name="restaurant-menu" size={48} color="#FF6D00" />
            </View>
          )}
        </View>

        {/* Title & Description */}
        <View className="px-6 pb-20">
          <Text className="text-2xl font-bold text-[#000000] dark:text-white">{dishData.name}</Text>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-[#FF6D00]">
              {formatMoney(dishData.price || 0)}
            </Text>
          </View>

          {dishData.description ? (
            <Text className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {dishData.description}
            </Text>
          ) : null}

          {/* Ingredients (prefer recipe API ingredients, fallback to dish payload) */}
          {(() => {
            const ingredientsToShow: any[] =
              recipeIngredients && recipeIngredients.length > 0
                ? recipeIngredients
                : (dishData as any).ingredients || [];

            if (!ingredientsToShow || ingredientsToShow.length === 0) return null;

            return (
              <View className="mt-4">
                <Text className="text-base font-bold text-[#000000] dark:text-white">
                  Ingredients
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                  <View className="flex-row gap-3">
                    {ingredientsToShow.map((ing: any) => (
                      <View
                        key={ing?.id || ing?.ingredientId || Math.random()}
                        className="w-[120px] rounded-xl border border-gray-200 p-2">
                        {getImageUrl(ing) ? (
                          <Image
                            source={{ uri: getImageUrl(ing) as string }}
                            style={{ width: "100%", height: 80, borderRadius: 8 }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="h-20 w-full items-center justify-center rounded-lg bg-gray-200">
                            <Text className="text-xl font-bold text-gray-600">
                              {(ing?.name || "?").charAt(0)}
                            </Text>
                          </View>
                        )}
                        <Text className="mt-2 text-sm font-medium text-[#000000] dark:text-white">
                          {ing?.name || ing?.ingredientName || "Unknown"}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            );
          })()}

          {/* Customize Button - navigates to customize-from/[id] */}
          <View className="mt-6">
            <Pressable
              onPress={() => router.push(`/(tabs)/menu/customize-from/${dishData.id}`)}
              className="w-full rounded-xl border-2 border-[#FF6D00] bg-orange-50 px-4 py-3 dark:bg-orange-900/20">
              <View className="flex-row items-center justify-center">
                <MaterialIcons name="edit" size={20} color="#FF6D00" />
                <Text className="ml-2 font-bold text-[#FF6D00]">Customize This Dish</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm text-gray-600 dark:text-gray-400">Qty • {qty}</Text>
          <Text className="text-2xl font-bold text-[#FF6D00]">
            {formatMoney((dishData.price || 0) * qty)}
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          {/* Quantity */}
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => setQty(Math.max(1, qty - 1))}
              className="h-10 w-10 items-center justify-center rounded-full border border-gray-300">
              <MaterialIcons name="remove" size={20} color="#000000" />
            </Pressable>
            <Text className="w-8 text-center text-lg font-bold text-[#000000] dark:text-white">
              {qty}
            </Text>
            <Pressable
              onPress={() => setQty(qty + 1)}
              className="h-10 w-10 items-center justify-center rounded-full border border-gray-300">
              <MaterialIcons name="add" size={20} color="#000000" />
            </Pressable>
          </View>

          {/* Add to Cart - Preset Only */}
          <Pressable
            onPress={() => {
              try {
                addItem({
                  dishId: Number(dishData.id ?? 0),
                  name: dishData.name || "Dish",
                  price: dishData.price || 0,
                  quantity: qty,
                  imageUrl: dishData.imageUrl || null,
                });
                Toast.show({ type: "success", text1: "Added to cart" });
                router.push("/(tabs)/cart");
              } catch {
                Toast.show({ type: "error", text1: "Add to cart failed" });
              }
            }}
            className="flex-1 rounded-full bg-[#FF6D00] py-3 active:bg-[#FF4D00]">
            <View className="flex-row items-center justify-center">
              <MaterialIcons name="shopping-cart" size={20} color="white" />
              <Text className="ml-2 font-bold text-white">Add to cart</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
