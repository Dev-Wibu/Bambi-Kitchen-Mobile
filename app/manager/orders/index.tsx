import ReloadButton from "@/components/ReloadButton";
import { useOrders } from "@/services/orderService";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type OrderStatus = "PENDING" | "COMPLETED" | "PAID" | "CANCELLED";

export default function OrdersManager() {
  const router = useRouter();
  const { data, isLoading, refetch, isError } = useOrders();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "#FFA500";
      case "COMPLETED":
        return "#4CAF50";
      case "PAID":
        return "#2196F3";
      case "CANCELLED":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "COMPLETED":
        return "Completed";
      case "PAID":
        return "Paid";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const filteredOrders = React.useMemo(() => {
    if (!data) return [];
    if (filterStatus === "ALL") return data;
    return data.filter((order: any) => order.status === filterStatus);
  }, [data, filterStatus]);

  const renderOrderItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => openOrderDetails(item)}
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
      <View className="mb-2 flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-lg font-bold">Order #{item.id}</Text>
          <Text className="mt-1 text-sm text-gray-600">
            {item.createAt
              ? new Date(item.createAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A"}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: getStatusColor(item.status),
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
          }}>
          <Text className="text-xs font-semibold text-white">{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View className="mt-2 border-t border-gray-200 pt-2">
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Customer ID:</Text>
          <Text className="font-semibold">#{item.userId}</Text>
        </View>
        {!!item.staffId && (
          <View className="mt-1 flex-row justify-between">
            <Text className="text-gray-600">Staff ID:</Text>
            <Text className="font-semibold">#{item.staffId}</Text>
          </View>
        )}
        <View className="mt-1 flex-row justify-between">
          <Text className="text-gray-600">Total:</Text>
          <Text className="font-bold text-[#FF6D00]">
            ${item.totalPrice?.toLocaleString("en-US")}
          </Text>
        </View>
        {!!item.ranking && (
          <View className="mt-1 flex-row justify-between">
            <Text className="text-gray-600">Rating:</Text>
            <Text className="font-semibold">⭐ {item.ranking}/5</Text>
          </View>
        )}
      </View>

      {!!item.note && (
        <View className="mt-2 rounded-lg bg-gray-100 p-2">
          <Text className="text-sm text-gray-700">{item.note}</Text>
        </View>
      )}
    </Pressable>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#FF6D00" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <MaterialIcons name="error-outline" size={64} color="#F44336" />
        <Text className="mt-4 text-xl font-bold text-gray-800">Data Loading Error</Text>
        <Text className="mt-2 text-center text-gray-600">Unable to load orders list</Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={{
            backgroundColor: "#FF6D00",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 24,
            marginTop: 16,
          }}>
          <Text className="font-semibold text-white">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="bg-white px-6 pb-6 pt-12"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "#E0E0E0",
        }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="mr-2">
              <MaterialIcons name="arrow-back" size={24} color="#FF6D00" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold">Order Management</Text>
              <Text className="mt-1 text-sm text-gray-600">
                Total: {filteredOrders.length} orders
              </Text>
            </View>
          </View>
          <ReloadButton onRefresh={() => refetch()} />
        </View>

        {/* Filter Status */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2 mt-4">
          <View className="flex-row gap-2 px-2">
            {["ALL", "PENDING", "PAID", "COMPLETED", "CANCELLED"].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setFilterStatus(status as any)}
                style={{
                  backgroundColor: filterStatus === status ? "#FF6D00" : "#F3F4F6",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}>
                <Text
                  style={{
                    color: filterStatus === status ? "white" : "#757575",
                    fontWeight: filterStatus === status ? "600" : "normal",
                  }}>
                  {status === "ALL" ? "All" : getStatusText(status as OrderStatus)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <MaterialIcons name="inbox" size={64} color="#BDBDBD" />
            <Text className="mt-4 text-lg text-gray-600">No orders found</Text>
          </View>
        }
      />

      {/* Order Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[80%] rounded-t-3xl bg-white p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold">Order Details #{selectedOrder?.id}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Order Info */}
              <View className="mb-4">
                <Text className="mb-2 text-gray-600">Order Information</Text>
                <View className="space-y-2 rounded-lg bg-gray-50 p-4">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-700">Created Date:</Text>
                    <Text className="font-semibold">
                      {selectedOrder?.createAt
                        ? new Date(selectedOrder.createAt).toLocaleDateString("en-US")
                        : "N/A"}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-700">Status:</Text>
                    <Text
                      style={{
                        color: selectedOrder?.status
                          ? getStatusColor(selectedOrder.status)
                          : "#757575",
                        fontWeight: "600",
                      }}>
                      {selectedOrder?.status && getStatusText(selectedOrder.status)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-700">Total:</Text>
                    <Text className="font-bold text-[#FF6D00]">
                      ${selectedOrder?.totalPrice?.toLocaleString("en-US")}
                    </Text>
                  </View>
                  {!!selectedOrder?.ranking && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-700">Rating:</Text>
                      <Text className="font-semibold">⭐ {selectedOrder.ranking}/5</Text>
                    </View>
                  )}
                  {!!selectedOrder?.comment && (
                    <View className="mt-2">
                      <Text className="mb-1 text-gray-700">Comment:</Text>
                      <Text className="text-gray-800">{selectedOrder.comment}</Text>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
