import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ActivityIndicator } from "react-native";
import { useCalculateCalories } from "@/services/geminiService";

interface AIReviewButtonProps {
  dishIds: number[];
  onReviewComplete?: (results: any[]) => void;
  onError?: (error: Error) => void;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
}

/**
 * Component button để trigger AI Review
 * Hiển thị loading state khi đang gọi API
 */
export function AIReviewButton({ 
  dishIds, 
  onReviewComplete,
  onError,
  variant = "default",
  size = "default"
}: AIReviewButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const calculateCalories = useCalculateCalories();

  const handleReview = async () => {
    if (!dishIds || dishIds.length === 0) {
      onError?.(new Error("No dishes to review"));
      return;
    }

    setIsLoading(true);
    try {
      const result = await calculateCalories.mutateAsync({
        body: dishIds,
      });
      
      onReviewComplete?.(result as any[]);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onPress={handleReview}
      disabled={isLoading || !dishIds || dishIds.length === 0}
      className="gap-2"
    >
      {isLoading ? (
        <>
          <ActivityIndicator size="small" />
          <Text>Analyzing...</Text>
        </>
      ) : (
        <>
          <Text className="text-lg">🤖</Text>
          <Text>AI Review</Text>
        </>
      )}
    </Button>
  );
}
