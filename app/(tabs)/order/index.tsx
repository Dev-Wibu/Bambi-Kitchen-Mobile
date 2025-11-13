import { Text } from "@/components/ui/text";
import { useOrdersByUserId } from "@/services/orderService";
import { useAuthStore } from "@/stores/authStore";
import { formatMoney } from "@/utils/currency";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FeedbackModal from "./components/FeedbackModal";
import OrderDetailModal from "./components/OrderDetailModal";

export default function OrderTab() {
  const { user } = useAuthStore();
  const userId = user?.userId;
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [feedbackOrderId, setFeedbackOrderId] = useState<number | null>(null);

  // Fetch orders from API
  const {
    data: ordersResponse,
    isLoading,
    refetch,
  } = useOrdersByUserId(userId!, {
    enabled: !!userId,
  });

  const orders = useMemo(() => {
    // API returns Orders[] directly, not wrapped in { data: [...] }
    const ordersList = ordersResponse ?? [];
    if (!Array.isArray(ordersList)) return [];

    // Sort by createAt descending (newest first)
    return [...ordersList].sort((a, b) => {
      const dateA = new Date(a.createAt || 0).getTime();
      const dateB = new Date(b.createAt || 0).getTime();
      return dateB - dateA;
    });
  }, [ordersResponse]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "PAID":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <MaterialIcons
        key={index}
        name={index < rating ? "star" : "star-border"}
        size={16}
        color="#FFA500"
      />
    ));
  };

  const handleViewDetails = (orderId: number) => {
    setSelectedOrderId(orderId);
  };

  const handleCloseDetails = () => {
    setSelectedOrderId(null);
  };

  const handleGiveFeedback = (orderId: number) => {
    setFeedbackOrderId(orderId);
  };

  const handleCloseFeedback = () => {
    setFeedbackOrderId(null);
  };

  const handleFeedbackSuccess = () => {
    refetch();
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#FF6D00"]} />
        }>
        {/* Header */}
        <View className="mb-8">
          <Text className="mb-2 text-3xl font-bold text-[#000000] dark:text-white">Orders</Text>
          <Text className="text-base text-gray-600 dark:text-gray-300">
            View your order history
          </Text>
        </View>

        {/* Loading State */}
        {isLoading && !refreshing && (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" color="#FF6D00" />
            <Text className="mt-4 text-sm text-gray-500">Loading your orders...</Text>
          </View>
        )}

        {/* Orders List or Empty State */}
        {!isLoading && orders && orders.length > 0 ? (
          <View className="gap-4">
            {orders.map((order) => (
              <View
                key={order.id}
                className="overflow-hidden rounded-2xl bg-white shadow-md dark:bg-gray-800">
                {/* Order Header */}
                <View className="border-b border-gray-100 p-4 dark:border-gray-700">
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-base font-bold text-[#000000] dark:text-white">
                      Order #{order.id || "N/A"}
                    </Text>
                    <View
                      className={`rounded-full px-3 py-1 ${getStatusColor(order.status || "")}`}>
                      <Text className="text-xs font-semibold">{order.status || "UNKNOWN"}</Text>
                    </View>
                  </View>
                  <Text className="text-sm text-[#757575]">
                    {order.createAt
                      ? format(new Date(order.createAt), "MMM dd, yyyy • hh:mm a")
                      : "Date unavailable"}
                  </Text>
                </View>

                {/* Order Details */}
                <View className="p-4">
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-sm text-[#757575] dark:text-gray-400">Total Amount</Text>
                    <Text className="text-xl font-bold text-[#FF6D00]">
                      {formatMoney(order.totalPrice || 0)}
                    </Text>
                  </View>

                  {order.note && (
                    <View className="mb-3">
                      <Text className="mb-1 text-xs font-semibold text-[#757575] dark:text-gray-400">
                        Note:
                      </Text>
                      <Text className="text-sm text-[#000000] dark:text-white">{order.note}</Text>
                    </View>
                  )}

                  {/* Show rating if already given feedback */}
                  {order.ranking !== undefined &&
                    order.ranking !== null &&
                    (order.status === "COMPLETED" || order.status === "PAID") && (
                      <View className="mb-3">
                        <Text className="mb-1 text-xs font-semibold text-[#757575] dark:text-gray-400">
                          Your Rating:
                        </Text>
                        <View className="flex-row gap-1">{renderStars(order.ranking)}</View>
                        <Text className="text-sm text-[#000000] dark:text-white">
                          {order.comment}
                        </Text>
                      </View>
                    )}

                  {/* Action Buttons */}
                  <View className="mt-3 flex-row gap-2">
                    <Pressable
                      className="flex-1 items-center rounded-lg bg-[#FF6D00] py-3"
                      onPress={() => handleViewDetails(order.id!)}>
                      <Text className="font-semibold text-white">View Details</Text>
                    </Pressable>
                    {/* Show feedback button for PAID or COMPLETED status if no ranking yet */}
                    {(order.status === "PAID" || order.status === "COMPLETED") && (
                      <Pressable
                        className="flex-1 items-center rounded-lg border border-[#FF6D00] bg-[#FF6D00] py-3"
                        onPress={() => handleGiveFeedback(order.id!)}>
                        <Text className="font-semibold text-white">Give Feedback</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : !isLoading ? (
          <View className="flex-1 items-center justify-center py-12">
            <MaterialIcons name="receipt-long" size={80} color="#E5E7EB" />
            <Text className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-400">
              No orders yet
            </Text>
            <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-500">
              Your order history will appear here
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <OrderDetailModal orderId={selectedOrderId} onClose={handleCloseDetails} />
      )}

      {/* Feedback Modal */}
      {feedbackOrderId && (
        <FeedbackModal
          orderId={feedbackOrderId}
          onClose={handleCloseFeedback}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </SafeAreaView>
  );
}
