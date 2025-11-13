import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { ScrollView, View } from "react-native";

// Define the GeminiResponseDto type based on the expected structure
interface GeminiResponseDto {
  score?: number;
  title?: string;
  roast?: string;
  totals?: {
    calories?: number;
    protein?: number;
    carb?: number;
    fat?: number;
    fiber?: number;
  };
  suggest?: string;
}

interface AIReviewModalProps {
  review: GeminiResponseDto;
  dishName?: string;
  onClose?: () => void;
  onApplySuggestion?: () => void;
}

/**
 * Component modal hiển thị kết quả AI Review
 * Hiển thị score, title, roast text, nutrition totals, và suggestions
 */
export function AIReviewModal({
  review,
  dishName,
  onClose,
  onApplySuggestion,
}: AIReviewModalProps) {
  if (!review) return null;

  const score = review.score || 0;
  const scorePercentage = (score / 10) * 100;

  const getScoreColor = () => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    if (score >= 4) return "bg-orange-500";
    return "bg-red-500";
  };

  const totals = review.totals;

  return (
    <ScrollView className="flex-1">
      <Card className="m-4">
        <CardHeader>
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="mb-1 text-xs text-muted-foreground">AI Review Results</Text>
              {dishName && (
                <Text className="mb-2 text-sm font-medium text-muted-foreground">{dishName}</Text>
              )}
              <CardTitle className="text-xl">{review.title}</CardTitle>
            </View>
            <Badge variant="secondary" className="ml-2">
              <Text className="text-lg font-bold">{score}/10</Text>
            </Badge>
          </View>

          <View className="mt-3">
            <Progress value={scorePercentage} className={`h-3 ${getScoreColor()}`} />
          </View>
        </CardHeader>

        <CardContent className="gap-4">
          {/* Roast Section */}
          <View className="rounded-lg bg-muted/50 p-4">
            <Text className="text-base leading-relaxed">{review.roast}</Text>
          </View>

          {/* Nutrition Totals */}
          {totals && (
            <View className="gap-2">
              <Text className="text-sm font-semibold">Nutrition Summary</Text>
              <View className="flex-row flex-wrap gap-2">
                <Badge variant="outline">
                  <Text className="text-xs">🔥 {totals.calories?.toFixed(0) || 0} kcal</Text>
                </Badge>
                <Badge variant="outline">
                  <Text className="text-xs">💪 {totals.protein?.toFixed(1) || 0}g protein</Text>
                </Badge>
                <Badge variant="outline">
                  <Text className="text-xs">🍚 {totals.carb?.toFixed(1) || 0}g carbs</Text>
                </Badge>
                <Badge variant="outline">
                  <Text className="text-xs">🧈 {totals.fat?.toFixed(1) || 0}g fat</Text>
                </Badge>
                <Badge variant="outline">
                  <Text className="text-xs">🌾 {totals.fiber?.toFixed(1) || 0}g fiber</Text>
                </Badge>
              </View>
            </View>
          )}

          {/* Suggestion Section */}
          {review.suggest && (
            <View className="gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">💡</Text>
                <Text className="text-sm font-semibold">Suggestion</Text>
              </View>
              <Text className="text-sm leading-relaxed">{review.suggest}</Text>
              {onApplySuggestion && (
                <Button variant="outline" size="sm" onPress={onApplySuggestion} className="mt-2">
                  <Text>Agree Suggestion</Text>
                </Button>
              )}
            </View>
          )}

          {/* Close Button */}
          {onClose && (
            <Button variant="secondary" onPress={onClose} className="mt-2">
              <Text>Close</Text>
            </Button>
          )}
        </CardContent>
      </Card>
    </ScrollView>
  );
}
