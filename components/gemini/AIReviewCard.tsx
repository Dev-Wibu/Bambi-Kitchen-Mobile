import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
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
export function AIReviewCard({ 
  review, 
  dishName,
  onExpand,
  compact = true 
}: AIReviewCardProps) {
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
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-lg">🤖</Text>
                <Text className="text-xs font-medium text-muted-foreground">
                  AI Review
                </Text>
              </View>
              {dishName && (
                <Text className="text-sm font-medium mb-1">{dishName}</Text>
              )}
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
                <View className="bg-muted/50 rounded-md p-3 mt-2">
                  <Text className="text-sm leading-relaxed">{review.roast}</Text>
                </View>
              )}

              {/* Nutrition summary */}
              {review.totals && (
                <View className="flex-row flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="gap-1">
                    <Text className="text-xs">
                      🔥 {review.totals.calories?.toFixed(0) || 0} kcal
                    </Text>
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Text className="text-xs">
                      💪 {review.totals.protein?.toFixed(1) || 0}g
                    </Text>
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Text className="text-xs">
                      🍚 {review.totals.carb?.toFixed(1) || 0}g
                    </Text>
                  </Badge>
                </View>
              )}

              {/* Suggestion */}
              {review.suggest && (
                <View className="bg-primary/5 rounded-md p-3 mt-2">
                  <View className="flex-row items-center gap-1 mb-1">
                    <Text className="text-sm">💡</Text>
                    <Text className="text-xs font-medium">Suggestion:</Text>
                  </View>
                  <Text className="text-xs text-muted-foreground">
                    {review.suggest}
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Tap to expand hint */}
          {compact && !isExpanded && (
            <Text className="text-xs text-muted-foreground text-center mt-1">
              Tap to see details
            </Text>
          )}
        </CardContent>
      </Card>
    </Pressable>
  );
}
