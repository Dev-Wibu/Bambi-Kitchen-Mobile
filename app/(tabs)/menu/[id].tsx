import { Text } from "@/components/ui/text";
import { $api } from "@/libs/api";
import { useCartStore } from "@/stores/cartStore";
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
  const {
    data: dish,
    isLoading,
    error,
    refetch,
  } = $api.useQuery("get", "/api/dish/{id}", {
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
        <Pressable onPress={() => router.back()} className="mt-4 rounded-xl bg-[#FF6D00] px-4 py-2">
          <Text className="text-white">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!dishData) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Text className="text-lg">Dish not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 rounded-xl bg-[#FF6D00] px-4 py-2">
          <Text className="text-white">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <Pressable onPress={() => router.back()} className="mr-3">
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
              ${((dishData.price || 0) / 100).toFixed(2)}
            </Text>
          </View>

          {dishData.description ? (
            <Text className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {dishData.description}
            </Text>
          ) : null}

          {/* Meta */}
          <View className="mt-4 flex-row gap-4">
            <View className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">
              <Text className="text-xs text-gray-600 dark:text-gray-300">
                Used: {dishData.usedQuantity ?? 0}
              </Text>
            </View>
            <View className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">
              <Text className="text-xs text-gray-600 dark:text-gray-300">Popular</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar (like Customize) */}
      <View className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm text-gray-600 dark:text-gray-400">Qty • {qty}</Text>
          <Text className="text-2xl font-bold text-[#FF6D00]">
            ${(((dishData.price || 0) * qty) / 100).toFixed(2)}
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

          {/* Add to Cart */}
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
