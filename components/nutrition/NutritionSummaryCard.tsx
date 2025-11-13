import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import type { components } from "@/schema-from-be";
import { View } from "react-native";

type Nutrition = components["schemas"]["Nutrition"];

interface NutritionSummaryCardProps {
  nutrition: Partial<Nutrition>;
  showProgress?: boolean;
}

/**
 * Component hiển thị đầy đủ nutrition breakdown
 * Với bar chart cho % daily value
 */
export function NutritionSummaryCard({
  nutrition,
  showProgress = true,
}: NutritionSummaryCardProps) {
  if (!nutrition) return null;

  const nutritionItems = [
    { label: "Calories", value: nutrition.calories || 0, unit: "kcal", icon: "🔥", max: 2000 },
    { label: "Protein", value: nutrition.protein || 0, unit: "g", icon: "💪", max: 50 },
    { label: "Carbohydrate", value: nutrition.carb || 0, unit: "g", icon: "🍚", max: 300 },
    { label: "Fiber", value: nutrition.fiber || 0, unit: "g", icon: "🌾", max: 25 },
    { label: "Fat (Saturated)", value: nutrition.sat_fat || 0, unit: "g", icon: "🧈", max: 20 },
    { label: "Sugar", value: nutrition.sugar || 0, unit: "g", icon: "🍬", max: 50 },
    { label: "Sodium", value: nutrition.sodium || 0, unit: "mg", icon: "🧂", max: 2300 },
    { label: "Iron", value: nutrition.iron || 0, unit: "mg", icon: "⚙️", max: 18 },
    { label: "Calcium", value: nutrition.calcium || 0, unit: "mg", icon: "🦴", max: 1000 },
  ];

  const getProgressColor = (percentage: number) => {
    if (percentage < 33) return "bg-green-500";
    if (percentage < 66) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition Information</CardTitle>
        {nutrition.per_unit && (
          <Text className="text-sm text-muted-foreground">Per {nutrition.per_unit}</Text>
        )}
      </CardHeader>
      <CardContent className="gap-3">
        {nutritionItems.map((item) => {
          const percentage = (item.value / item.max) * 100;

          return (
            <View key={item.label} className="gap-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium">
                  {item.icon} {item.label}
                </Text>
                <Text className="text-sm font-semibold">
                  {typeof item.value === "number" ? item.value.toFixed(1) : item.value} {item.unit}
                </Text>
              </View>
              {showProgress && (
                <View className="flex-row items-center gap-2">
                  <View className="flex-1">
                    <Progress value={percentage} className="h-2" />
                  </View>
                  <Text className="w-12 text-right text-xs text-muted-foreground">
                    {percentage.toFixed(0)}%
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </CardContent>
    </Card>
  );
}
