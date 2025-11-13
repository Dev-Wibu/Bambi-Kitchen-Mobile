import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import type { components } from "@/schema-from-be";
import { View } from "react-native";

type Nutrition = components["schemas"]["Nutrition"];

interface NutritionBadgeProps {
  nutrition: Partial<Nutrition>;
  showCaloriesOnly?: boolean;
}

/**
 * Component hiển thị nutrition info dạng badge ngắn gọn
 * Sử dụng trong dish card, cart item
 */
export function NutritionBadge({ nutrition, showCaloriesOnly = false }: NutritionBadgeProps) {
  if (!nutrition) return null;

  if (showCaloriesOnly) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Text className="text-xs">🔥 {nutrition.calories || 0} kcal</Text>
      </Badge>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {nutrition.calories !== undefined && (
        <Badge variant="secondary" className="gap-1">
          <Text className="text-xs">🔥 {nutrition.calories} kcal</Text>
        </Badge>
      )}
      {nutrition.protein !== undefined && nutrition.protein > 0 && (
        <Badge variant="outline" className="gap-1">
          <Text className="text-xs">💪 {nutrition.protein.toFixed(1)}g protein</Text>
        </Badge>
      )}
      {nutrition.carb !== undefined && nutrition.carb > 0 && (
        <Badge variant="outline" className="gap-1">
          <Text className="text-xs">🍚 {nutrition.carb.toFixed(1)}g carb</Text>
        </Badge>
      )}
    </View>
  );
}
