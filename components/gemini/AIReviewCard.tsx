import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useState } from "react";
import { Pressable, View } from "react-native";

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

interface AIReviewCardProps {
  review: GeminiResponseDto;
  dishName?: string;
  onExpand?: () => void;
  compact?: boolean;
}

/**
 * Component card compact để hiển thị AI Review
 * Sử dụng trong order history
 * Click để expand xem full
 */
export function AIReviewCard({ review, dishName, onExpand, compact = true }: AIReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);

  if (!review) return null;

  const score = review.score || 0;

  const getScoreBadgeVariant = () => {
    if (score >= 8) return "default";
    if (score >= 6) return "secondary";
    return "outline";
  };

  const handlePress = () => {
    if (compact && onExpand) {
      onExpand();
    } else if (compact) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="gap-2 py-3">
          {/* Header with score */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="mb-1 flex-row items-center gap-2">
                <Text className="text-lg">🤖</Text>
                <Text className="text-xs font-medium text-muted-foreground">AI Review</Text>
              </View>
              {dishName && <Text className="mb-1 text-sm font-medium">{dishName}</Text>}
              <Text className="text-sm font-semibold">{review.title}</Text>
            </View>
            <Badge variant={getScoreBadgeVariant()}>
              <Text className="text-base font-bold">{score}/10</Text>
            </Badge>
          </View>

          {/* Expanded content */}
          {isExpanded && (
            <>
              {/* Roast text */}
              {review.roast && (
                <View className="mt-2 rounded-md bg-muted/50 p-3">
                  <Text className="text-sm leading-relaxed">{review.roast}</Text>
                </View>
              )}

              {/* Nutrition summary */}
              {review.totals && (
                <View className="mt-2 flex-row flex-wrap gap-1">
                  <Badge variant="outline" className="gap-1">
                    <Text className="text-xs">
                      🔥 {review.totals.calories?.toFixed(0) || 0} kcal
                    </Text>
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Text className="text-xs">💪 {review.totals.protein?.toFixed(1) || 0}g</Text>
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Text className="text-xs">🍚 {review.totals.carb?.toFixed(1) || 0}g</Text>
                  </Badge>
                </View>
              )}

              {/* Suggestion */}
              {review.suggest && (
                <View className="mt-2 rounded-md bg-primary/5 p-3">
                  <View className="mb-1 flex-row items-center gap-1">
                    <Text className="text-sm">💡</Text>
                    <Text className="text-xs font-medium">Suggestion:</Text>
                  </View>
                  <Text className="text-xs text-muted-foreground">{review.suggest}</Text>
                </View>
              )}
            </>
          )}

          {/* Tap to expand hint */}
          {compact && !isExpanded && (
            <Text className="mt-1 text-center text-xs text-muted-foreground">
              Tap to see details
            </Text>
          )}
        </CardContent>
      </Card>
    </Pressable>
  );
}
