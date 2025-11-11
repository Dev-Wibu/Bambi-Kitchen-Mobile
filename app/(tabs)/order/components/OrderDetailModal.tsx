import { Text } from "@/components/ui/text";
import { MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator, Modal, Pressable, ScrollView, View } from "react-native";
import { useOrderDetailsByOrderId } from "@/services/orderService";
import { $api } from "@/libs/api";
import { useMemo } from "react";
import OrderDetailItem from "./OrderDetailItem";

interface OrderDetailModalProps {
  orderId: number;
  onClose: () => void;
}

export default function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const { data: orderDetails, isLoading } = useOrderDetailsByOrderId(orderId);
  const { data: ingredientsRaw } = $api.useQuery("get", "/api/ingredient");

  const details = useMemo(() => {
    const detailsList = orderDetails?.data ?? orderDetails ?? [];
    return Array.isArray(detailsList) ? detailsList : [];
  }, [orderDetails]);

  // Create a map of ingredient names for quick lookup
  const ingNameById = useMemo(() => {
    const map = new Map<number, string>();
    (ingredientsRaw?.data ?? ingredientsRaw ?? []).forEach((i: any) => {
      map.set(i.id, i.name);
    });
    return map;
  }, [ingredientsRaw]);

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="max-h-[80%] rounded-t-3xl bg-white dark:bg-gray-900">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <Text className="text-lg font-bold text-[#000000] dark:text-white">
              Order Details #{orderId}
            </Text>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#000000" />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView className="px-6 py-4">
            {isLoading ? (
              <View className="py-8">
                <ActivityIndicator size="large" color="#FF6D00" />
              </View>
            ) : details.length === 0 ? (
              <View className="py-8">
                <Text className="text-center text-gray-500">No details found</Text>
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
