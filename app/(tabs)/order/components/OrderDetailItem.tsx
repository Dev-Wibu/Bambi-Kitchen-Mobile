import { Text } from "@/components/ui/text";
import { MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, View } from "react-native";
import { formatMoney } from "@/utils/currency";
import { $api } from "@/libs/api";
import { useMemo, useState } from "react";

interface OrderDetailItemProps {
  detail: any;
  ingNameById: Map<number, string>;
}

export default function OrderDetailItem({ detail, ingNameById }: OrderDetailItemProps) {
  const dishId = detail.dish?.id;
  const [showRecipe, setShowRecipe] = useState(false);

  // Fetch recipe if dish has an ID
  const { data: recipeData, isLoading: recipeLoading } = $api.useQuery(
    "get",
    "/api/recipe/by-dish/{id}",
    {
      params: { path: { id: dishId || 0 } },
      enabled: !!dishId && showRecipe,
    }
  );

  const recipe = useMemo(() => {
    if (!recipeData) return [];
    // The response might be wrapped or direct
    const data = (recipeData as any)?.data ?? recipeData;
    if (!data) return [];
    
    // Extract ingredients array from the response
    const ingredients = (data as any)?.ingredients ?? [];
    return Array.isArray(ingredients) ? ingredients : [];
  }, [recipeData]);

  return (
    <View className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <View className="mb-2 flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="mb-1 font-semibold text-[#000000] dark:text-white">
            {detail.dish?.name || "Custom Dish"}
          </Text>
          {detail.size && (
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Size: {detail.size}
            </Text>
          )}
        </View>
        <View className="items-end">
          <Text className="font-bold text-[#FF6D00]">
            {formatMoney(detail.dish?.price || 0)}
          </Text>
        </View>
      </View>

      {detail.totalCalories !== undefined && detail.totalCalories > 0 && (
        <View className="mt-2 flex-row items-center">
          <MaterialIcons name="local-fire-department" size={16} color="#FF6D00" />
          <Text className="ml-1 text-sm text-gray-600 dark:text-gray-400">
            {detail.totalCalories} cal
          </Text>
        </View>
      )}

      {detail.notes && (
        <View className="mt-2">
          <Text className="text-xs font-semibold text-gray-500">Notes:</Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">{detail.notes}</Text>
        </View>
      )}

      {/* Recipe toggle button */}
      {dishId && (
        <View className="mt-3">
          <Pressable
            onPress={() => setShowRecipe(!showRecipe)}
            className="flex-row items-center">
            <MaterialIcons
              name={showRecipe ? "expand-less" : "expand-more"}
              size={20}
              color="#FF6D00"
            />
            <Text className="ml-1 text-sm font-semibold text-[#FF6D00]">
              {showRecipe ? "Hide" : "Show"} Ingredients
            </Text>
          </Pressable>

          {/* Recipe details */}
          {showRecipe && (
            <View className="mt-2 rounded-lg bg-white p-3 dark:bg-gray-900">
              {recipeLoading ? (
                <View className="py-2">
                  <ActivityIndicator size="small" color="#FF6D00" />
                </View>
              ) : recipe.length === 0 ? (
                <Text className="text-sm text-gray-500">No ingredients found</Text>
              ) : (
                <View className="gap-1">
                  {recipe.map((item: any, idx: number) => {
                    const ingredientName =
                      ingNameById.get(item.id) || item.name || `Ingredient #${item.id}`;
                    return (
                      <View key={idx} className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <View className="mr-2 h-1.5 w-1.5 rounded-full bg-[#FF6D00]" />
                          <Text className="text-sm text-gray-700 dark:text-gray-300">
                            {ingredientName}
                          </Text>
                        </View>
                        {item.quantity && (
                          <Text className="text-xs text-gray-500">{item.quantity}g</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
