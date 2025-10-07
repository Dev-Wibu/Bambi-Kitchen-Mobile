import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { Discount } from "@/interfaces/discount.interface";
import {
  transformDiscountCreateRequest,
  transformDiscountUpdateRequest,
  useCreateDiscount,
  useDeleteDiscount,
  useDiscounts,
  useUpdateDiscount,
} from "@/services/discountService";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import DiscountForm from "./DiscountForm";

export default function DiscountManagement() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Discount | null>(null);

  const queryClient = useQueryClient();

  // Query hooks
  const { data: discounts, isLoading } = useDiscounts();
  const createMutation = useCreateDiscount();
  const updateMutation = useUpdateDiscount();
  const deleteMutation = useDeleteDiscount();

  const handleAdd = () => {
    setSelectedDiscount(null);
    setIsFormVisible(true);
  };

  const handleEdit = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsFormVisible(true);
  };

  const handleDelete = (discount: Discount) => {
    setDeleteConfirm(discount);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm?.id) return;

    try {
      await deleteMutation.mutateAsync({
        params: { path: { id: deleteConfirm.id } },
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Discount deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/discount"] });
      setDeleteConfirm(null);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete discount",
      });
    }
  };

  const handleSubmit = async (data: {
    name: string;
    discountPercent?: number;
    quantity?: number;
    startTime?: string;
    endTime?: string;
    code?: string;
    description?: string;
  }) => {
    try {
      if (selectedDiscount?.id) {
        // Update existing discount
        const updateData = transformDiscountUpdateRequest({
          id: selectedDiscount.id,
          name: data.name,
          discountPercent: data.discountPercent,
          quantity: data.quantity,
          startTime: data.startTime,
          endTime: data.endTime,
          description: data.description,
        });

        await updateMutation.mutateAsync({
          body: updateData,
        });

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Discount updated successfully",
        });
      } else {
        // Create new discount
        const createData = transformDiscountCreateRequest({
          name: data.name,
          discountPercent: data.discountPercent,
          quantity: data.quantity,
          startTime: data.startTime,
          endTime: data.endTime,
          code: data.code,
          description: data.description,
        });

        await createMutation.mutateAsync({
          body: createData,
        });

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Discount created successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/discount"] });
      setIsFormVisible(false);
      setSelectedDiscount(null);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: selectedDiscount ? "Failed to update discount" : "Failed to create discount",
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#FF6D00" />
        <Text className="mt-4 text-base text-gray-600 dark:text-gray-300">
          Loading discounts...
        </Text>
      </SafeAreaView>
    );
  }

  if (isFormVisible) {
    return (
      <DiscountForm
        discount={selectedDiscount}
        onSubmit={handleSubmit}
        onCancel={() => {
          setIsFormVisible(false);
          setSelectedDiscount(null);
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  if (deleteConfirm) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <MaterialIcons
              name="warning"
              size={48}
              color="#FF6D00"
              style={{ alignSelf: "center" }}
            />
            <Text className="mt-4 text-center text-xl font-bold text-[#000000] dark:text-white">
              Confirm Delete
            </Text>
            <Text className="mt-2 text-center text-base text-gray-600 dark:text-gray-300">
              Are you sure you want to delete the discount &quot;{deleteConfirm.name}&quot;?
            </Text>
            <View className="mt-6 flex-row gap-3">
              <Button
                className="flex-1 bg-gray-300 active:bg-gray-400"
                onPress={() => setDeleteConfirm(null)}>
                <Text className="font-semibold text-[#000000]">Cancel</Text>
              </Button>
              <Button
                className="flex-1 bg-red-500 active:bg-red-600"
                onPress={confirmDelete}
                disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="font-semibold text-white">Delete</Text>
                )}
              </Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-[#000000] dark:text-white">
                Discount Management
              </Text>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Manage discount codes and promotions
              </Text>
            </View>
            <Button className="bg-[#FF6D00] active:bg-[#FF4D00]" onPress={handleAdd}>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="add" size={20} color="white" />
                <Text className="font-semibold text-white">Add</Text>
              </View>
            </Button>
          </View>
        </View>

        {/* Discounts List */}
        <ScrollView className="flex-1" contentContainerClassName="p-6">
          {!discounts || discounts.length === 0 ? (
            <View className="items-center py-12">
              <MaterialIcons name="local-offer" size={64} color="#ccc" />
              <Text className="mt-4 text-center text-base text-gray-600 dark:text-gray-300">
                No discounts found
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {discounts.map((discount: Discount) => (
                <TouchableOpacity
                  key={discount.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                  activeOpacity={0.7}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-lg font-bold text-[#000000] dark:text-white">
                          {discount.name}
                        </Text>
                        {discount.discountPercent !== undefined && (
                          <View className="rounded-full bg-green-100 px-2 py-1">
                            <Text className="text-xs font-semibold text-green-700">
                              {discount.discountPercent}% OFF
                            </Text>
                          </View>
                        )}
                      </View>
                      {discount.code && (
                        <Text className="mt-1 font-mono text-sm text-[#FF6D00]">
                          Code: {discount.code}
                        </Text>
                      )}
                      {discount.description && (
                        <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {discount.description}
                        </Text>
                      )}
                      <View className="mt-2 flex-row flex-wrap gap-2">
                        {discount.quantity !== undefined && (
                          <View className="rounded-full bg-blue-100 px-2 py-1">
                            <Text className="text-xs font-semibold text-blue-700">
                              Qty: {discount.quantity}
                            </Text>
                          </View>
                        )}
                        {discount.startTime && (
                          <View className="rounded-full bg-purple-100 px-2 py-1">
                            <Text className="text-xs font-semibold text-purple-700">
                              From: {formatDate(discount.startTime)}
                            </Text>
                          </View>
                        )}
                        {discount.endTime && (
                          <View className="rounded-full bg-orange-100 px-2 py-1">
                            <Text className="text-xs font-semibold text-orange-700">
                              Until: {formatDate(discount.endTime)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        className="rounded-lg bg-blue-500 p-2 active:bg-blue-600"
                        onPress={() => handleEdit(discount)}>
                        <MaterialIcons name="edit" size={20} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="rounded-lg bg-red-500 p-2 active:bg-red-600"
                        onPress={() => handleDelete(discount)}>
                        <MaterialIcons name="delete" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
