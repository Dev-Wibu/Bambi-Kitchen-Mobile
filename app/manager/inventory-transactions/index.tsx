import { Button } from "@/components/ui/button";

import { Text } from "@/components/ui/text";

import type { InventoryTransaction } from "@/interfaces/inventoryTransaction.interface";

import {
  useDeleteInventoryTransaction,
  useInventoryTransactions,
} from "@/services/inventoryTransactionService";

import { MaterialIcons } from "@expo/vector-icons";

import { useQueryClient } from "@tanstack/react-query";

import { useState } from "react";

import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Toast from "react-native-toast-message";

export default function InventoryTransactionManagement() {
  const [deleteConfirm, setDeleteConfirm] = useState<InventoryTransaction | null>(null);

  const queryClient = useQueryClient();

  // Query hooks

  const { data: transactions, isLoading } = useInventoryTransactions();

  const deleteMutation = useDeleteInventoryTransaction();

  const handleDelete = (transaction: InventoryTransaction) => {
    setDeleteConfirm(transaction);
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

        text2: "Transaction deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/inventory-transactions"] });

      setDeleteConfirm(null);
    } catch {
      Toast.show({
        type: "error",

        text1: "Error",

        text2: "Failed to delete transaction",
      });
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";

    return new Date(dateStr).toLocaleString();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#FF6D00" />

        <Text className="mt-4 text-base text-gray-600 dark:text-gray-300">
          Loading transactions...
        </Text>
      </SafeAreaView>
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
              Are you sure you want to delete this inventory transaction?
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

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1">
        {/* Header */}

        <View className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-[#000000] dark:text-white">
                Inventory Transaction Management
              </Text>

              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                View and manage inventory transactions
              </Text>
            </View>
          </View>
        </View>

        {/* Transactions List */}

        <ScrollView className="flex-1" contentContainerClassName="p-6">
          {!Array.isArray(transactions) || transactions.length === 0 ? (
            <View className="items-center py-12">
              <MaterialIcons name="inventory" size={64} color="#ccc" />

              <Text className="mt-4 text-center text-base text-gray-600 dark:text-gray-300">
                No transactions found
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {(transactions as InventoryTransaction[]).map((transaction: InventoryTransaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                  activeOpacity={0.7}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <MaterialIcons
                          name={transaction.transactionType ? "add-circle" : "remove-circle"}
                          size={24}
                          color={transaction.transactionType ? "#4ade80" : "#ef4444"}
                        />

                        <Text className="text-lg font-bold text-[#000000] dark:text-white">
                          {transaction.ingredient?.name || "Unknown Ingredient"}
                        </Text>
                      </View>

                      <View className="mt-2 flex-row items-center gap-2">
                        <View
                          className={`rounded-full px-3 py-1 ${
                            transaction.transactionType ? "bg-green-100" : "bg-red-100"
                          }`}>
                          <Text
                            className={`text-sm font-semibold ${
                              transaction.transactionType ? "text-green-700" : "text-red-700"
                            }`}>
                            {transaction.transactionType ? "+" : "-"} {transaction.quantity || 0}
                          </Text>
                        </View>

                        <Text className="text-sm text-gray-600 dark:text-gray-300">
                          {transaction.transactionType ? "Added to" : "Removed from"} inventory
                        </Text>
                      </View>

                      {transaction.orders && (
                        <Text className="mt-1 text-sm text-gray-500">
                          Order ID: {transaction.orders.id}
                        </Text>
                      )}

                      <Text className="mt-1 text-xs text-gray-500">
                        {formatDate(transaction.createAt)}
                      </Text>
                    </View>

                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        className="rounded-lg bg-red-500 p-2 active:bg-red-600"
                        onPress={() => handleDelete(transaction)}>
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
