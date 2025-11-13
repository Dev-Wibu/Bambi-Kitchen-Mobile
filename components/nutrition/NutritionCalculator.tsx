import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { calculateTotalNutrition } from "@/services/nutritionService";
import type { components } from "@/schema-from-be";

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
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Nutrition Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="text-sm text-muted-foreground">
            Add ingredients to see nutrition information
          </Text>
        </CardContent>
      </Card>
    );
  }

  const nutritionSummary = [
    { label: "Calories", value: totalNutrition.calories || 0, unit: "kcal", icon: "🔥" },
    { label: "Protein", value: totalNutrition.protein || 0, unit: "g", icon: "💪" },
    { label: "Carbs", value: totalNutrition.carb || 0, unit: "g", icon: "🍚" },
    { label: "Fiber", value: totalNutrition.fiber || 0, unit: "g", icon: "🌾" },
  ];

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="text-sm">Total Nutrition</CardTitle>
        <Text className="text-xs text-muted-foreground">
          {ingredients.length} ingredient{ingredients.length > 1 ? "s" : ""} selected
        </Text>
      </CardHeader>
      <CardContent>
        <View className="flex-row flex-wrap gap-4">
          {nutritionSummary.map((item) => (
            <View key={item.label} className="flex-col items-center min-w-[60px]">
              <Text className="text-lg mb-1">{item.icon}</Text>
              <Text className="text-lg font-bold">
                {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
              </Text>
              <Text className="text-xs text-muted-foreground">{item.unit}</Text>
              <Text className="text-xs font-medium">{item.label}</Text>
            </View>
          ))}
        </View>
      </CardContent>
    </Card>
  );
}
