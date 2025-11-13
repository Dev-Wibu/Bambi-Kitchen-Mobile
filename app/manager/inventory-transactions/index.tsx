import { Filter, type FilterCriteria } from "@/components/Filter";

import ReloadButton from "@/components/ReloadButton";

import { SearchBar } from "@/components/SearchBar";

import { SortButton } from "@/components/SortButton";

import { Button } from "@/components/ui/button";

import { Text } from "@/components/ui/text";

import { getPageInfo, usePagination } from "@/hooks/usePagination";

import { useSortable } from "@/hooks/useSortable";

import type { InventoryTransaction } from "@/interfaces/inventoryTransaction.interface";

import { useInventoryTransactions } from "@/services/inventoryTransactionService";

import { MaterialIcons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import { useEffect, useMemo, useState } from "react";

import { ActivityIndicator, FlatList, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function InventoryTransactionManagement() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");

  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria[]>([]);

  const [pageSize, setPageSize] = useState(50);

  // Query hooks

  const { data: transactions, isLoading, refetch } = useInventoryTransactions();

  // Process transactions data

  const transactionsArray = useMemo(() => {
    return Array.isArray(transactions) ? transactions : [];
  }, [transactions]);

  // Reverse the list to show newest first

  const reversedTransactions = useMemo(() => {
    return transactionsArray ? [...transactionsArray].reverse() : [];
  }, [transactionsArray]);

  // Filter and search

  const filteredTransactions = useMemo(() => {
    let filtered = reversedTransactions;

    // Apply search

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();

      filtered = filtered.filter(
        (transaction) =>
          transaction.ingredient?.name?.toLowerCase().includes(lowerSearch) ||
          transaction.note?.toLowerCase().includes(lowerSearch)
      );
    }

    // Apply filters

    filterCriteria.forEach((filter) => {
      if (filter.field === "transactionType" && typeof filter.value === "string") {
        const isInbound = filter.value === "true";

        filtered = filtered.filter((transaction) => transaction.transactionType === isInbound);
      }

      if (filter.field === "quantity" && typeof filter.value === "object") {
        const range = filter.value as { from: number | undefined; to: number | undefined };

        filtered = filtered.filter((transaction) => {
          const quantity = transaction.quantity || 0;

          if (range.from !== undefined && quantity < range.from) return false;

          if (range.to !== undefined && quantity > range.to) return false;

          return true;
        });
      }
    });

    return filtered;
  }, [reversedTransactions, searchTerm, filterCriteria]);

  // Sorting

  const { sortedData, getSortProps } = useSortable<InventoryTransaction>(filteredTransactions);

  // Pagination

  const pagination = usePagination({
    totalCount: sortedData.length,

    pageSize,

    initialPage: 1,
  });

  // Current page data

  const currentPageData = useMemo(() => {
    return sortedData.slice(pagination.startIndex, pagination.endIndex + 1);
  }, [sortedData, pagination.startIndex, pagination.endIndex]);

  // Reset pagination when filters change

  useEffect(() => {
    pagination.setPage(1);
  }, [searchTerm, filterCriteria]);

  // Filter options

  const filterOptions = useMemo(
    () => [
      {
        label: "Transaction Type",

        value: "transactionType",

        type: "select" as const,

        selectOptions: [
          { value: "true", label: "Inbound (Add)" },

          { value: "false", label: "Outbound (Remove)" },
        ],
      },

      {
        label: "Quantity",

        value: "quantity",

        type: "numberRange" as const,

        numberRangeConfig: {
          fromPlaceholder: "Min quantity",

          toPlaceholder: "Max quantity",

          min: 0,

          step: 1,
        },
      },
    ],

    []
  );

  // Search options

  const searchOptions = useMemo(
    () => [
      { value: "ingredient", label: "Ingredient" },

      { value: "note", label: "Note" },
    ],

    []
  );

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

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1">
        {/* Header */}

        <View className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-3">
              <TouchableOpacity onPress={() => router.back()} className="mr-2">
                <MaterialIcons name="arrow-back" size={24} color="#FF6D00" />
              </TouchableOpacity>

              <View className="flex-1">
                <Text className="text-2xl font-bold text-[#000000] dark:text-white">
                  Inventory Transaction Management
                </Text>

                <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  View inventory transactions (read-only for audit trail)
                </Text>
              </View>
            </View>

            <ReloadButton onRefresh={() => refetch()} />
          </View>
        </View>

        {/* Transactions List */}

        <View className="flex-1 px-6 pt-4">
          {/* Search and Filter */}

          <View className="mb-4 gap-3">
            <SearchBar
              searchOptions={[]}
              onSearchChange={setSearchTerm}
              placeholder="Search by ingredient or note..."
              limitedFields={false}
              resetPagination={pagination.reset}
            />

            <Filter
              filterOptions={filterOptions}
              onFilterChange={(criteria) => {
                setFilterCriteria(criteria);

                pagination.setPage(1);
              }}
            />
          </View>

          {/* Table Header with Sort */}

          <View className="mb-2 flex-row items-center border-b border-gray-200 pb-2 dark:border-gray-700">
            <View className="flex-1">
              <SortButton {...getSortProps("ingredient")} label="Ingredient" />
            </View>

            <View className="w-32">
              <SortButton {...getSortProps("quantity")} label="Quantity" />
            </View>

            <View className="w-32">
              <SortButton {...getSortProps("createAt")} label="Date" />
            </View>
          </View>

          {/* Transactions FlatList */}

          {isLoading ? (
            <View className="flex-1 items-center justify-center py-12">
              <ActivityIndicator size="large" color="#FF6D00" />
            </View>
          ) : currentPageData.length === 0 ? (
            <View className="items-center py-12">
              <MaterialIcons name="inventory" size={64} color="#ccc" />

              <Text className="mt-4 text-center text-base text-gray-600 dark:text-gray-300">
                {searchTerm || filterCriteria.length > 0
                  ? "No transactions found matching your criteria"
                  : "No transactions found"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={currentPageData}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={({ item: transaction }) => (
                <View className="mb-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
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
                  </View>
                </View>
              )}
              ListFooterComponent={
                <View className="mt-4 flex-row items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                  <Text className="text-sm text-gray-600 dark:text-gray-300">
                    {getPageInfo(pagination)}
                  </Text>

                  <View className="flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={pagination.prevPage}
                      disabled={pagination.currentPage === 1}>
                      <MaterialIcons name="chevron-left" size={20} />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onPress={pagination.nextPage}
                      disabled={pagination.currentPage === pagination.totalPages}>
                      <MaterialIcons name="chevron-right" size={20} />
                    </Button>
                  </View>
                </View>
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
