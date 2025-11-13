import { Text } from "@/components/ui/text";
import type { components } from "@/schema-from-be";
import { calculateTotalNutrition } from "@/services/nutritionService";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

type Nutrition = components["schemas"]["Nutrition"];

interface IngredientWithNutrition {
  ingredientId: number;
  nutrition: Nutrition;
  quantity: number;
}

interface NutritionCalculatorProps {
  ingredients: IngredientWithNutrition[];
}

/**
 * Component tính toán real-time nutrition khi user chọn ingredients
 * Sử dụng trong customize bowl screen
 */
export function NutritionCalculator({ ingredients }: NutritionCalculatorProps) {
  const [totalNutrition, setTotalNutrition] = useState<Partial<Nutrition>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!ingredients || ingredients.length === 0) {
      setTotalNutrition({});
      return;
    }

    const nutritionData = ingredients.map((item) => ({
      nutrition: item.nutrition,
      quantity: item.quantity,
    }));

    const total = calculateTotalNutrition(nutritionData);
    setTotalNutrition(total);
  }, [ingredients]);

  if (!ingredients || ingredients.length === 0) {
    return (
      <View className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
        <View className="flex-row items-center justify-center gap-2">
          <MaterialIcons name="info-outline" size={20} color="#9CA3AF" />
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            Add ingredients to see nutrition
          </Text>
        </View>
      </View>
    );
  }

  const nutritionData = [
    {
      label: "Calories",
      value: totalNutrition.calories || 0,
      unit: "kcal",
      icon: "local-fire-department",
      color: "#FF6D00",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      label: "Protein",
      value: totalNutrition.protein || 0,
      unit: "g",
      icon: "fitness-center",
      color: "#2563EB",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Carbs",
      value: totalNutrition.carb || 0,
      unit: "g",
      icon: "rice-bowl",
      color: "#16A34A",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      label: "Fiber",
      value: totalNutrition.fiber || 0,
      unit: "g",
      icon: "eco",
      color: "#CA8A04",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
  ];

  const extendedNutritionData = [
    {
      label: "Saturated Fat",
      value: totalNutrition.sat_fat || 0,
      unit: "g",
      icon: "opacity",
      color: "#DC2626",
    },
    {
      label: "Sugar",
      value: totalNutrition.sugar || 0,
      unit: "g",
      icon: "cookie",
      color: "#EA580C",
    },
    {
      label: "Sodium",
      value: totalNutrition.sodium || 0,
      unit: "mg",
      icon: "grain",
      color: "#D97706",
    },
    {
      label: "Calcium",
      value: totalNutrition.calcium || 0,
      unit: "mg",
      icon: "medication",
      color: "#0891B2",
    },
    {
      label: "Iron",
      value: totalNutrition.iron || 0,
      unit: "mg",
      icon: "build",
      color: "#7C2D12",
    },
  ];

  return (
    <View className="overflow-hidden rounded-2xl border-2 border-[#FF6D00]/20 bg-white dark:bg-gray-800">
      {/* Header */}
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between border-b border-gray-200 bg-[#FF6D00]/5 px-4 py-3 active:bg-[#FF6D00]/10 dark:border-gray-700">
        <View className="flex-1">
          <Text className="text-sm font-bold text-[#FF6D00]">Nutrition Facts</Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400">
            {ingredients.length} ingredient{ingredients.length > 1 ? "s" : ""} • Tap to{" "}
            {isExpanded ? "collapse" : "expand"}
          </Text>
        </View>
        <MaterialIcons
          name={isExpanded ? "expand-less" : "expand-more"}
          size={24}
          color="#FF6D00"
        />
      </Pressable>

      {/* Main Nutrition - Always Visible */}
      <View className="p-4">
        <View className="flex-row flex-wrap gap-3">
          {nutritionData.map((item) => (
            <View
              key={item.label}
              className={`min-w-[45%] flex-1 items-center rounded-xl p-3 ${item.bgColor}`}>
              <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
                <MaterialIcons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text className="text-xl font-bold text-[#000000] dark:text-white">
                {typeof item.value === "number" ? item.value.toFixed(1) : item.value}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">{item.unit}</Text>
              <Text className="mt-1 text-xs font-semibold" style={{ color: item.color }}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Extended Nutrition - Collapsible */}
      {isExpanded && (
        <View className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <Text className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Additional Nutrients
          </Text>
          <View className="gap-2">
            {extendedNutritionData.map((item) => (
              <View
                key={item.label}
                className="flex-row items-center justify-between rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${item.color}20` }}>
                    <MaterialIcons name={item.icon as any} size={16} color={item.color} />
                  </View>
                  <Text className="font-medium text-[#000000] dark:text-white">{item.label}</Text>
                </View>
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-lg font-bold" style={{ color: item.color }}>
                    {typeof item.value === "number" ? item.value.toFixed(1) : item.value}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{item.unit}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
