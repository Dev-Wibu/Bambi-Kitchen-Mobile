import { Text } from "@/components/ui/text";
import { useFeedbackOrderWithToast } from "@/services/orderService";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

interface FeedbackModalProps {
  orderId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function FeedbackModal({ orderId, onClose, onSuccess }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const feedbackMutation = useFeedbackOrderWithToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      Toast.show({
        type: "error",
        text1: "Rating required",
        text2: "Please select a rating before submitting",
      });
      return;
    }

    try {
      await feedbackMutation.mutateAsync({
        body: {
          orderId,
          ranking: rating,
          comment: comment.trim() || undefined,
        },
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isActive = starNumber <= (hoveredStar || rating);

      return (
        <Pressable
          key={index}
          onPress={() => setRating(starNumber)}
          onPressIn={() => setHoveredStar(starNumber)}
          onPressOut={() => setHoveredStar(0)}
          className="p-1">
          <MaterialIcons
            name={isActive ? "star" : "star-border"}
            size={40}
            color={isActive ? "#FFA500" : "#D1D5DB"}
          />
        </Pressable>
      );
    });
  };

  return (
    <Modal visible={true} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/60 px-4">
        <View className="w-full max-w-md rounded-3xl bg-white shadow-2xl dark:bg-gray-900">
          {/* Header */}
          <View className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-[#000000] dark:text-white">
                Rate Your Order
              </Text>
              <Pressable
                onPress={onClose}
                className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                <MaterialIcons name="close" size={24} color="#757575" />
              </Pressable>
            </View>
            <Text className="mt-2 text-sm text-gray-600 dark:text-gray-400">Order #{orderId}</Text>
          </View>

          {/* Content */}
          <View className="px-6 py-6">
            {/* Rating Section */}
            <View className="mb-6">
              <Text className="mb-3 text-base font-semibold text-[#000000] dark:text-white">
                How was your experience?
              </Text>
              <View className="flex-row justify-center gap-1">{renderStars()}</View>
              {rating > 0 && (
                <Text className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </Text>
              )}
            </View>

            {/* Comment Section */}
            <View className="mb-6">
              <Text className="mb-2 text-base font-semibold text-[#000000] dark:text-white">
                Additional Comments (Optional)
              </Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Share your thoughts about the food, service, delivery..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                className="rounded-xl border border-gray-300 bg-white p-4 text-base text-[#000000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                style={{
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={onClose}
                disabled={feedbackMutation.isPending}
                className="flex-1 items-center rounded-xl border border-gray-300 py-3 dark:border-gray-600">
                <Text className="font-semibold text-gray-700 dark:text-gray-300">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={feedbackMutation.isPending || rating === 0}
                className={`flex-1 items-center rounded-xl py-3 ${
                  feedbackMutation.isPending || rating === 0
                    ? "bg-gray-300 dark:bg-gray-700"
                    : "bg-[#FF6D00]"
                }`}>
                {feedbackMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="font-semibold text-white">Submit</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
