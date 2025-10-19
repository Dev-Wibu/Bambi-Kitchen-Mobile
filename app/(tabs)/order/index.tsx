import { Text } from "@/components/ui/text";
import { USE_MOCK_DATA, mockOrders } from "@/data/mockData";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderTab() {
  const orders = USE_MOCK_DATA ? mockOrders : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="mb-2 text-3xl font-bold text-[#000000] dark:text-white">Orders</Text>
          <Text className="text-base text-gray-600 dark:text-gray-300">
            View your order history
          </Text>
        </View>

        {orders && orders.length > 0 ? (
          <View className="gap-4">
            {orders.map((order) => (
              <View
                key={order.id}
                className="overflow-hidden rounded-2xl bg-white shadow-md dark:bg-gray-800">
                {/* Order Header */}
                <View className="border-b border-gray-100 p-4 dark:border-gray-700">
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-base font-bold text-[#000000] dark:text-white">
                      Order #{order.id}
                    </Text>
                    <View
                      className={`rounded-full px-3 py-1 ${getStatusColor(order.status || "")}`}>
                      <Text className="text-xs font-semibold">{order.status}</Text>
                    </View>
                  </View>
                  <Text className="text-sm text-[#757575]">
                    {format(new Date(order.createAt!), "MMM dd, yyyy • hh:mm a")}
                  </Text>
                </View>

                {/* Order Details */}
                <View className="p-4">
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-sm text-[#757575]">Total Amount</Text>
                    <Text className="text-xl font-bold text-[#FF6D00]">
                      ${(order.totalPrice! / 100).toFixed(2)}
                    </Text>
                  </View>

                  {order.note && (
                    <View className="mb-3">
                      <Text className="mb-1 text-xs font-semibold text-[#757575]">Note:</Text>
                      <Text className="text-sm text-[#000000] dark:text-white">{order.note}</Text>
                    </View>
                  )}

                  {order.ranking && order.status === "COMPLETED" && (
                    <View className="mb-3">
                      <Text className="mb-1 text-xs font-semibold text-[#757575]">
                        Your Rating:
                      </Text>
                      <View className="flex-row gap-1">{renderStars(order.ranking)}</View>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View className="mt-3 flex-row gap-2">
                    <Pressable className="flex-1 items-center rounded-lg bg-[#FF6D00] py-3">
                      <Text className="font-semibold text-white">View Details</Text>
                    </Pressable>
                    {order.status === "COMPLETED" && (
                      <Pressable className="flex-1 items-center rounded-lg border border-[#FF6D00] py-3">
                        <Text className="font-semibold text-[#FF6D00]">Reorder</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-12">
            <MaterialIcons name="receipt-long" size={80} color="#E5E7EB" />
            <Text className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-400">
              No orders yet
            </Text>
            <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-500">
              Your order history will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
