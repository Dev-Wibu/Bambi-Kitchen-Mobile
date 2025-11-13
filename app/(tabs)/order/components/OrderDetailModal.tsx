import { Text } from "@/components/ui/text";
import { $api } from "@/libs/api";
import { useOrderDetailsByOrderId } from "@/services/orderService";
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, View } from "react-native";
import OrderDetailItem from "./OrderDetailItem";

interface OrderDetailModalProps {
  orderId: number;
  onClose: () => void;
}

export default function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const { data: orderDetails, isLoading } = useOrderDetailsByOrderId(orderId);
  const { data: ingredientsRaw } = $api.useQuery("get", "/api/ingredient");

  const details = useMemo(() => {
    const detailsList = orderDetails ?? [];
    return Array.isArray(detailsList) ? detailsList : [];
  }, [orderDetails]);

  // Create a map of ingredient names for quick lookup
  const ingNameById = useMemo(() => {
    const map = new Map<number, string>();
    (ingredientsRaw ?? []).forEach((i: any) => {
      map.set(i.id, i.name);
    });
    return map;
  }, [ingredientsRaw]);

  return (
    <Modal visible={true} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/60 px-4">
        <View
          className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-gray-900"
          style={{ maxHeight: "85%" }}>
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-700">
            <Text className="text-xl font-bold text-[#000000] dark:text-white">
              Order Details #{orderId}
            </Text>
            <Pressable onPress={onClose} className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
              <MaterialIcons name="close" size={24} color="#757575" />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView className="px-6 py-4">
            {isLoading ? (
              <View className="py-12">
                <ActivityIndicator size="large" color="#FF6D00" />
                <Text className="mt-4 text-center text-sm text-gray-500">
                  Loading order details...
                </Text>
              </View>
            ) : details.length === 0 ? (
              <View className="py-12">
                <MaterialIcons
                  name="receipt-long"
                  size={64}
                  color="#E5E7EB"
                  style={{ alignSelf: "center" }}
                />
                <Text className="mt-4 text-center text-base font-semibold text-gray-600 dark:text-gray-400">
                  No details found
                </Text>
                <Text className="mt-2 text-center text-sm text-gray-500">
                  This order doesn't have any items
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {details.map((detail: any, index: number) => (
                  <OrderDetailItem
                    key={detail.id || index}
                    detail={detail}
                    ingNameById={ingNameById}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
